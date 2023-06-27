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
exports.controller = void 0;
const express_1 = __importDefault(require("express"));
const token_controller_1 = __importDefault(require("../controllers/token.controller"));
const config_1 = require("../config");
const router = express_1.default.Router();
exports.controller = new token_controller_1.default();
router.post("/token/create/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.platform) {
            const responseCode = 422;
            return res.status(responseCode).json({ message: 'Platform kitöltése kötelező.', code: responseCode });
        }
        const platform = req.body.platform;
        const response = yield exports.controller.createToken(platform);
        if (response.error) {
            const error = response.error;
            const responseCode = error.code || 500;
            return res.status(responseCode).json(error);
        }
        if (!response.token) {
            throw new Error('Sikertelen token generálás. Hibakód: TRC#27');
        }
        return res.send(response);
    }
    catch (e) {
        const responseCode = 500;
        return res.status(responseCode).json({ message: `Váratlan hiba történt: ${e}`, code: responseCode });
    }
}));
router.patch('/token/renew', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.token) {
            const responseCode = 422;
            return res.status(responseCode).json({ message: 'Token megadása kötelező.', code: responseCode });
        }
        const token = req.body.token;
        const response = yield exports.controller.renewToken(token);
        if (response.error) {
            const error = response.error;
            const responseCode = error.code || 500;
            return res.status(responseCode).json(error);
        }
        return res.status(200).json({ success: true, remaining: config_1.tokenConfig.maxRemainingToken });
    }
    catch (e) {
        const responseCode = 500;
        return res.status(responseCode).json({ message: `Váratlan hiba történt: ${e}`, code: responseCode });
    }
}));
exports.default = router;
