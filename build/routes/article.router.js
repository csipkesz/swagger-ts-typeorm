"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const article_controller_1 = __importDefault(require("../controllers/article.controller"));
const router = express_1.default.Router();
const controller = new article_controller_1.default();
router.post("/article/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.title) {
            const responseCode = 422;
            return res.status(responseCode).json({ message: `Title megadása kötelező. `, code: responseCode });
        }
        const title = req.body.title;
        if (!req.body.description) {
            const responseCode = 422;
            return res.status(responseCode).json({ message: `Description megadása kötelező. `, code: responseCode });
        }
        const description = req.body.description;
        const response = yield controller.createArticle({ title, description });
        if (response.error) {
            const error = response.error;
            const responseCode = error.code || 500;
            return res.status(responseCode).json(error);
        }
        return res.status(200).json(response);
    }
    catch (e) {
        const responseCode = 500;
        return res.status(responseCode).json({ message: `Váratlan hiba történt: ${e}`, code: responseCode });
    }
}));
router.get('/article/detail/:id/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.id || isNaN(parseInt(req.params.id))) {
            const responseCode = 422;
            return res.status(responseCode).json({ message: `Nem megfelelő azonosító paraméter.`, code: responseCode });
        }
        const id = parseInt(req.params.id);
        if (!req.params.token) {
            const responseCode = 422;
            return res.status(responseCode).json({ message: `Nem megfelelő token paraméter.`, code: responseCode });
        }
        const token = req.params.token;
        const response = yield controller.detailArticle(id, token);
        if (response.error) {
            const error = response.error;
            const responseCode = error.code || 500;
            return res.status(responseCode).json(error);
        }
        return res.status(200).json(response);
    }
    catch (e) {
        const responseCode = 500;
        return res.status(responseCode).json({ message: `Váratlan hiba történt: ${e}`, code: responseCode });
    }
}));
router.get('/article/list/:pageSize/:page', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.pageSize || isNaN(parseInt(req.params.pageSize))) {
            const responseCode = 422;
            return res.status(responseCode).json({ message: `Nem megfelelő pageSize paraméter.`, code: responseCode });
        }
        const pageSize = parseInt(req.params.pageSize);
        if (!req.params.page || isNaN(parseInt(req.params.page))) {
            const responseCode = 422;
            return res.status(responseCode).json({ message: `Nem megfelelő page paraméter.`, code: responseCode });
        }
        const page = parseInt(req.params.page);
        const response = yield controller.listArticles(pageSize, page);
        if (response.error) {
            const error = response.error;
            const responseCode = error.code || 500;
            return res.status(responseCode).json(error);
        }
        return res.status(200).json(response);
    }
    catch (e) {
        const responseCode = 500;
        return res.status(responseCode).json({ message: `Váratlan hiba történt: ${e}`, code: responseCode });
    }
}));
exports.default = router;
