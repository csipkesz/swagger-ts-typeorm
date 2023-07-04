import { Request, Response, query } from "express";
import { Body, Example, Get, Header, Patch, Post, Query, Route } from "tsoa";
import { AppDataSource } from "../data-source";
import { Article } from "../entity/article.entity";
import { controller as TokenController } from "../routes/token.router";
import { validate } from 'class-validator';


const articleRepository = AppDataSource.getRepository(Article);

type returnError = {
    message: string,
    code: number
}

type articleParameters = {
    title: string,
    description: string
}

type simpleArticle = {
    id: number, 
    title: string
}
type paginationMeta = {
    pageSize: number,
    pageCount: number,
    page: number,
    count: number
}

interface responseCreateArticle {
    id?: number
    title?: string,
    description?: string,
    error?: returnError
}

interface responseDetailArticle {
    id?: number,
    title?: string,
    description?: string,
    error?: returnError
}

interface responseListArticles {
    list?: Array<simpleArticle>
    meta?: paginationMeta,
    error?: returnError
}

@Route("article") 
export default class ArticleController {

    /**
    * Cikk létrehozása
    * @param params
    * @example params {"title":"Mosógép", "description": "Nagyon hasznos, ki tudja mosni a ruhákat meg egyéb textiliákat."}
    * @param token
    * @example token "2f0c60af-1a50-11ee-b92b-2cf05d2e710e"
    */
    @Example<responseCreateArticle>({
        id: 1,
        title: "Mosógép",
        description: "Nagyon hasznos, ki tudja mosni a ruhákat meg egyéb textiliákat."
    })
    @Example<responseCreateArticle>({
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    })
    @Post("/create")
    public async createArticle(@Header() token: string, @Body() params: articleParameters): Promise<responseCreateArticle> {
        // if(params.title.length > 100) {
        //     return { error: { message: 'A title hossza maximum 100 karakter lehet.', code: 422 } }
        // }

        // if(params.description.length > 5000) {
        //     return { error: { message: 'A description mező hossza maximum 50000 karakter lehet.', code: 422 } }
        // }

        const createResult = await articleRepository.create({ title: params.title, description: params.description });

        const validateErrors = await validate(createResult);
        if(validateErrors.length > 0) {
            throw new Error(validateErrors.toString());
        }

        const saveResult = await articleRepository.save(createResult);
        if(!saveResult) {
            return { error: { message: 'Váratlan adatbázishiba történt a művelet során.', code: 500 } }
        }

        const decrementResult = await TokenController.decrementRemaining(token);
        if(!decrementResult.success) {
            return { error: decrementResult.error };
        }

        return {
            id: saveResult.id,
            title: saveResult.title,
            description: saveResult.description
        }
    }


     /**
        * Cikk lekérdezése ID alapján, a token felhasználásra kerül.
        * @param id
        * @example id "15"
        * @param token
        * @example token "2f0c60af-1a50-11ee-b92b-2cf05d2e710e"
        * 
    */
     @Example<responseDetailArticle>({
        id: 1,
        title: "Mosógép",
        description: "Nagyon hasznos, ki tudja mosni a ruhákat meg egyéb textiliákat."
    })
    @Example<responseDetailArticle>({
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    })
    @Get("/detail/{id}")
    public async detailArticle(id: number, @Header() token: string): Promise<responseDetailArticle> {
        const entityArticle = await articleRepository.findOneBy({ id: id });
        if(!entityArticle) {
            return { error: { message: 'A megadott azonosítóval nem található cikk.', code: 403 } };
        }

        const decrementResult = await TokenController.decrementRemaining(token);
        if(!decrementResult.success) {
            return { error: decrementResult.error };
        }

        return { ...entityArticle };
    }

    /**
        * Cikk lista lekérdezése.
        * @param page
        * @example page 1
        * @param pageSize
        * @example pageSize 10
        * 
    */
    @Example<responseListArticles>({
        list: [
            { id: 1, title: "Mosógép" },
            { id: 2, title: "Hűtőszekrény" },
            { id: 3, title: "Mosogatógép" },
        ],
        meta: { count: 60, page: 1, pageCount: 20, pageSize: 3 }
    })
    @Example<responseListArticles>({
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    })
    @Get('/list/{pageSize}/{page}')
    public async listArticles(pageSize: number, page: number): Promise<responseListArticles> {
        const currentArticleCount = await articleRepository.count();
        if(!currentArticleCount) {
            return { error: { message: 'Nincs egyetlen lekérhető cikk sem.', code: 204 } };
        }

        const maxPageWithPageSize = Math.ceil(currentArticleCount / pageSize);
        const currentPage = Math.min( Math.max( 1, page ), maxPageWithPageSize );

        const result = await articleRepository
                        .createQueryBuilder('article')
                        .select('id')
                        .addSelect('title')
                        .skip( (currentPage - 1) * pageSize )
                        .take(pageSize)
                        .getRawMany();

        return {
            list: result,
            meta: { count: currentArticleCount, page: currentPage, pageCount: maxPageWithPageSize, pageSize: pageSize }
        }
    }

}