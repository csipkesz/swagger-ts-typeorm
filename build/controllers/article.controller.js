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
const data_source_1 = require("../data-source");
const article_entity_1 = require("../entity/article.entity");
const token_router_1 = require("../routes/token.router");
const articleRepository = data_source_1.AppDataSource.getRepository(article_entity_1.Article);
let ArticleController = class ArticleController {
    /**
    * Cikk létrehozása
    * @param params
    * @example params {"title":"Mosógép", "description": "Nagyon hasznos, ki tudja mosni a ruhákat meg egyéb textiliákat."}
    */
    createArticle(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.title.length > 100) {
                return { error: { message: 'A title hossza maximum 100 karakter lehet.', code: 422 } };
            }
            if (params.description.length > 5000) {
                return { error: { message: 'A description mező hossza maximum 50000 karakter lehet.', code: 422 } };
            }
            const createResult = yield articleRepository.create({ title: params.title, description: params.description });
            const saveResult = yield articleRepository.save(createResult);
            if (!saveResult) {
                return { error: { message: 'Váratlan adatbázishiba történt a művelet során.', code: 500 } };
            }
            return {
                id: saveResult.id,
                title: saveResult.title,
                description: saveResult.description
            };
        });
    }
    /**
       * Cikk lekérdezése ID alapján, a token felhasználásra kerül.
       * @param id
       * @example id "15"
       * @param token
       * @example token "77464b35-7631-4ab1-b2d8-9f1800a0aa4f"
       *
   */
    detailArticle(id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const isTokenValid = yield token_router_1.controller.doesTokenExists(token, true);
            if (!isTokenValid) {
                return { error: { message: 'A megadott token nem létezik, vagy már nem használható fel.', code: 403 } };
            }
            const entityArticle = yield articleRepository.findOneBy({ id: id });
            if (!entityArticle) {
                return { error: { message: 'A megadott azonosítóval nem található cikk.', code: 403 } };
            }
            const decrementResult = yield token_router_1.controller.decrementRemaining(token);
            if (!decrementResult.success) {
                return { error: decrementResult.error };
            }
            return Object.assign({}, entityArticle);
        });
    }
    /**
        * Cikk lista lekérdezése.
        * @param page
        * @example page 1
        * @param pageSize
        * @example pageSize 10
        *
    */
    listArticles(pageSize, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentArticleCount = yield articleRepository.count();
            if (!currentArticleCount) {
                return { error: { message: 'Nincs egyetlen lekérhető cikk sem.', code: 204 } };
            }
            const maxPageWithPageSize = Math.ceil(currentArticleCount / pageSize);
            const currentPage = Math.min(Math.max(1, page), maxPageWithPageSize);
            const result = yield articleRepository
                .createQueryBuilder('article')
                .select('id')
                .addSelect('title')
                .skip((currentPage - 1) * pageSize)
                .take(pageSize)
                .getRawMany();
            return {
                list: result,
                meta: { count: currentArticleCount, page: currentPage, pageCount: maxPageWithPageSize, pageSize: pageSize }
            };
        });
    }
};
__decorate([
    (0, tsoa_1.Example)({
        id: 1,
        title: "Mosógép",
        description: "Nagyon hasznos, ki tudja mosni a ruhákat meg egyéb textiliákat."
    }),
    (0, tsoa_1.Example)({
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    }),
    (0, tsoa_1.Post)("/create"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "createArticle", null);
__decorate([
    (0, tsoa_1.Example)({
        id: 1,
        title: "Mosógép",
        description: "Nagyon hasznos, ki tudja mosni a ruhákat meg egyéb textiliákat."
    }),
    (0, tsoa_1.Example)({
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    }),
    (0, tsoa_1.Get)("/detail/{id}/{token}"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "detailArticle", null);
__decorate([
    (0, tsoa_1.Example)({
        list: [
            { id: 1, title: "Mosógép" },
            { id: 2, title: "Hűtőszekrény" },
            { id: 3, title: "Mosogatógép" },
        ],
        meta: { count: 60, page: 1, pageCount: 20, pageSize: 3 }
    }),
    (0, tsoa_1.Example)({
        error: {
            message: 'Hibaüzenet, ami leírja a pontos hibát.',
            code: 500
        }
    }),
    (0, tsoa_1.Get)('/list/{pageSize}/{page}'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "listArticles", null);
ArticleController = __decorate([
    (0, tsoa_1.Route)("article")
], ArticleController);
exports.default = ArticleController;
