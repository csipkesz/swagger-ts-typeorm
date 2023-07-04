import { Body, Example, Get, Header, Patch, Post, Query, Route } from "tsoa";
import { AppDataSource } from "../data-source";
import { Token, platformTypes } from "../entity/token.entity";
import { LessThan, MoreThan } from "typeorm";
import { tokenConfig } from "../config";

type returnError = {
    message: string,
    code: number
}

interface responseCreateToken {
    success: boolean,
    remaining?: number,
    token?: string,
    error?: returnError
}

interface responseRenewToken {
    success: boolean, 
    remaining?: number,
    error?: returnError
}

interface responseDecrementToken {
    success: boolean, 
    error?: returnError
}

const tokenRepository = AppDataSource.getRepository(Token);

@Route("token") 
export default class TokenController {

    private lastTokenCreate: number = Date.now();

     /**
     * UUID token létrehozása a cikkek eléréséhez.
     * @param platform
     * @example platform {"platform":"IOS"}
     * @example platform {"platform":"WEB"}
     * @example platform {"platform":"ANDROID"}
     */
    @Example<responseCreateToken>({
        success: true,
        remaining: tokenConfig.maxRemainingToken,
        token: '1a204ee3-9d94-45cb-82c6-34e66754e2d5',
    })
    @Example<responseCreateToken>({
        success: false,
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    })
    @Post("/create")
    public async createToken(@Body() platform: string): Promise<responseCreateToken> {
        if(tokenConfig.createAntiflood.state && !tokenConfig.createAntiflood.availableToUse(this.lastTokenCreate)) {
            return {
                success: false,
                error: { message: `Nem sikerült legenerálni a tokent. Kérem próbálja újra!`, code: 429 }
            }
        }
        this.lastTokenCreate = Date.now();

        platform = platform.toUpperCase();
        if(!platformTypes.includes(platform)) {
            return {
                success: false,
                error: { message: `Nem megfelelő "platform" paraméterezés. Lehetséges értékek: ${platformTypes.join(', ')}`, code: 422 }
            }
        }

        const createResult = await tokenRepository.create({ platform: platform });
        const saveResult = await tokenRepository.save(createResult);
        if(!saveResult) {
            return {
                success: false,
                error: { message: `Probléma adódott a token generálása közben. Hibakód: TCC#90`,code: 500 }
            } 
        }

        return {
            success: true,
            token: saveResult.uuid,
            remaining: tokenConfig.maxRemainingToken,
        };
    }

    /**
     * UUID token frissítése.
     * @param token
     * @example token "2f0c60af-1a50-11ee-b92b-2cf05d2e710e"
     */
    @Example<responseCreateToken>({
        success: true,
        remaining: tokenConfig.maxRemainingToken,
    })
    @Example<responseCreateToken>({
        success: false,
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    })
    @Patch('/renew')
    public async renewToken(@Header() token: string): Promise<responseRenewToken> {
        // if(!token) {
        //     return {
        //         success: false,
        //         error: { message: `Token megadása kötelező.`, code: 422 }
        //     }
        // }

        // if(!await this.doesTokenExists(token)) {
        //     return {
        //         success: false,
        //         error: { message: `Token nem létezik, vagy nem megfelelő a formátum.`, code: 422 }
        //     }
        // }

        const updateResult = await tokenRepository.update( { uuid: token, remaining: LessThan(5) }, { remaining: tokenConfig.maxRemainingToken })
        if(!updateResult.affected) {
            return {
                success: false,
                error: { message: `Nem sikerült a token frissítése. (Lehet, hogy nemrégiben már frissítésre került.)`, code: 409 }
            }
        }

        return {
            success: true,
            remaining: tokenConfig.maxRemainingToken,
        };
    };

    public async doesTokenExists(token: string, checkRemaining: boolean = false) {
        let queryObject: object = { uuid: token };
        if(checkRemaining) {
            queryObject = { ...queryObject, remaining: MoreThan(0) };
        }

        const doesTokenExists = await tokenRepository.countBy(queryObject);
        return doesTokenExists ? true : false;
    }

    public async decrementRemaining(token: string): Promise<responseDecrementToken> {
        const decrementResult = await tokenRepository.decrement({ uuid: token, remaining: MoreThan(0) }, 'remaining', 1);
        if(!decrementResult.affected) {
            return {
                success: false,
                error: { message: `A tranzakció végrehajtása sikertelen, érvényes token hiányában.`, code: 403 }
            }
        }

        return { success: true, };
    }
}