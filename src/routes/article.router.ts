import express, { Request } from "express";
import ArticleController from "../controllers/article.controller";

const router = express.Router();
const controller = new ArticleController();

router.post("/article/create", async (req, res) => { 
    try {
        if(!req.body.title) {
            const responseCode: number = 422;
            return res.status(responseCode).json( { message: `Title megadása kötelező. `, code: responseCode } );
        }
        const title = req.body.title;

        if(!req.body.description) {
            const responseCode: number = 422;
            return res.status(responseCode).json( { message: `Description megadása kötelező. `, code: responseCode } );
        }
        const description = req.body.description;
        
        const response = await controller.createArticle( {title, description} );
        if(response.error) {
            const error = response.error;
            const responseCode = error.code || 500;
            return res.status(responseCode).json(error);
        }

        return res.status(200).json(response);
    }
    catch(e) {
        const responseCode: number = 500;
        return res.status(responseCode).json( { message: `Váratlan hiba történt: ${e}`, code: responseCode } );
    }
});

router.get('/article/detail/:id/:token', async (req, res) => {
    try {
        if(!req.params.id || isNaN(parseInt(req.params.id))) {
            const responseCode: number = 422;
            return res.status(responseCode).json( { message: `Nem megfelelő azonosító paraméter.`, code: responseCode } );
        }
        const id: number = parseInt(req.params.id);

        if(!req.params.token) {
            const responseCode: number = 422;
            return res.status(responseCode).json( { message: `Nem megfelelő token paraméter.`, code: responseCode } );
        }
        const token = req.params.token;
        
        const response = await controller.detailArticle( id, token );
        if(response.error) {
            const error = response.error;
            const responseCode = error.code || 500;
            return res.status(responseCode).json(error);
        }

        return res.status(200).json(response);

    }
    catch(e) {
        const responseCode: number = 500;
        return res.status(responseCode).json( { message: `Váratlan hiba történt: ${e}`, code: responseCode } );
    }
});


router.get('/article/list/:pageSize/:page', async (req, res) => {
    try {
        if(!req.params.pageSize || isNaN(parseInt(req.params.pageSize))) {
            const responseCode: number = 422;
            return res.status(responseCode).json( { message: `Nem megfelelő pageSize paraméter.`, code: responseCode } );
        }
        const pageSize: number = parseInt(req.params.pageSize);

        if(!req.params.page || isNaN(parseInt(req.params.page))) {
            const responseCode: number = 422;
            return res.status(responseCode).json( { message: `Nem megfelelő page paraméter.`, code: responseCode } );
        }
        const page: number = parseInt(req.params.page);

        const response = await controller.listArticles( pageSize, page );
        if(response.error) {
            const error = response.error;
            const responseCode = error.code || 500;
            return res.status(responseCode).json(error);
        }

        return res.status(200).json(response);
    }
    catch(e) {
        const responseCode: number = 500;
        return res.status(responseCode).json( { message: `Váratlan hiba történt: ${e}`, code: responseCode } );
    }
});

export default router;