import "reflect-metadata"
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import routerToken from "./routes/token.router";
import routerArticle from "./routes/article.router";

import { AppDataSource } from "./data-source";

import * as dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8000;
const app: Application = express();

app.use(express.json());
app.use(morgan("tiny")); 
app.use(express.static("public"));

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
        url: "/swagger.json",
    },
  })
);

//#region routers
app.use(routerToken);
app.use(routerArticle);
//#endregion


AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
        console.log("Server is running on port", PORT);
    });
  })
  .catch((error) => {
      console.log("Unable to connect to db", error);
});
