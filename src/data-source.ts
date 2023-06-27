import { DataSource } from "typeorm";
import { Token } from "./entity/token.entity";
import { Article } from "./entity/article.entity"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "nest",
    synchronize: true,
    logging: true,
    entities: [Token, Article],
    subscribers: [],
    migrations: [],
})