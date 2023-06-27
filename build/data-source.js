"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const token_entity_1 = require("./entity/token.entity");
const article_entity_1 = require("./entity/article.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "nest",
    synchronize: true,
    logging: true,
    entities: [token_entity_1.Token, article_entity_1.Article],
    subscribers: [],
    migrations: [],
});
