"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const uuid_1 = require("uuid");
const data_source_1 = require("../data-source");
const token_entity_1 = require("../entity/token.entity");
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
const tokenRepository = data_source_1.AppDataSource.getRepository(token_entity_1.Token);
let TokenController = class TokenController {
    constructor() {
        this.lastTokenCreate = Date.now();
    }
    /**
    * UUID token létrehozása a cikkek eléréséhez.
    * @param platform
    * @example platform {"platform":"IOS"}
    * @example platform {"platform":"WEB"}
    * @example platform {"platform":"ANDROID"}
    */
    createToken(platform) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config_1.tokenConfig.createAntiflood.state && !config_1.tokenConfig.createAntiflood.availableToUse(this.lastTokenCreate)) {
                return {
                    success: false,
                    error: { message: `Nem sikerült legenerálni a tokent. Kérem próbálja újra!`, code: 429 }
                };
            }
            this.lastTokenCreate = Date.now();
            platform = platform.toUpperCase();
            if (!token_entity_1.platformTypes.includes(platform)) {
                return {
                    success: false,
                    error: { message: `Nem megfelelő "platform" paraméterezés. Lehetséges értékek: ${token_entity_1.platformTypes.join(', ')}`, code: 422 }
                };
            }
            const generatedToken = (0, uuid_1.v4)();
            if (yield this.doesTokenExists(generatedToken)) {
                return {
                    success: false,
                    error: { message: `Probléma adódott a token generálása közben. Próbálja újra!`, code: 500 }
                };
            }
            const createResult = yield tokenRepository.create({ uuid: generatedToken, platform: platform });
            const saveResult = yield tokenRepository.save(createResult);
            if (!saveResult) {
                return {
                    success: false,
                    error: { message: `Probléma adódott a token generálása közben. Hibakód: TCC#90`, code: 500 }
                };
            }
            return {
                success: true,
                token: generatedToken,
                remaining: config_1.tokenConfig.maxRemainingToken,
            };
        });
    }
    /**
     * UUID token frissítése.
     * @param token
     * @example token {"token":"77464b35-7631-4ab1-b2d8-9f1800a0aa4f"}
     */
    renewToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token) {
                return {
                    success: false,
                    error: { message: `Token megadása kötelező.`, code: 422 }
                };
            }
            if (!(yield this.doesTokenExists(token))) {
                return {
                    success: false,
                    error: { message: `Token nem létezik, vagy nem megfelelő a formátum.`, code: 422 }
                };
            }
            const updateResult = yield tokenRepository.update({ uuid: token, remaining: (0, typeorm_1.LessThan)(5) }, { remaining: config_1.tokenConfig.maxRemainingToken });
            if (!updateResult.affected) {
                return {
                    success: false,
                    error: { message: `Nem sikerült a token frissítése. (Lehet, hogy nemrégiben már frissítésre került.)`, code: 409 }
                };
            }
            return {
                success: true,
                remaining: config_1.tokenConfig.maxRemainingToken,
            };
        });
    }
    ;
    doesTokenExists(token, checkRemaining = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryObject = { uuid: token };
            if (checkRemaining) {
                queryObject = Object.assign(Object.assign({}, queryObject), { remaining: (0, typeorm_1.MoreThan)(0) });
            }
            const doesTokenExists = yield tokenRepository.countBy(queryObject);
            return doesTokenExists ? true : false;
        });
    }
    decrementRemaining(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const decrementResult = yield tokenRepository.decrement({ uuid: token, remaining: (0, typeorm_1.MoreThan)(0) }, 'remaining', 1);
            if (!decrementResult.affected) {
                return {
                    success: false,
                    error: { message: `A tranzakció végrehajtása sikertelen, érvényes token hiányában.`, code: 403 }
                };
            }
            return { success: true, };
        });
    }
};
__decorate([
    (0, tsoa_1.Example)({
        success: true,
        remaining: config_1.tokenConfig.maxRemainingToken,
        token: '1a204ee3-9d94-45cb-82c6-34e66754e2d5',
    }),
    (0, tsoa_1.Example)({
        success: false,
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    }),
    (0, tsoa_1.Post)("/create"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "createToken", null);
__decorate([
    (0, tsoa_1.Example)({
        success: true,
        remaining: config_1.tokenConfig.maxRemainingToken,
    }),
    (0, tsoa_1.Example)({
        success: false,
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    }),
    (0, tsoa_1.Patch)('/renew'),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "renewToken", null);
TokenController = __decorate([
    (0, tsoa_1.Route)("token")
], TokenController);
exports.default = TokenController;
