import express, { Request } from "express";
import TokenController from "../controllers/token.controller";
import { tokenConfig } from "../config";
import { checkTokenDoesExists } from "../middleware/token.middleware";

const router = express.Router();
export const controller = new TokenController();

router.post("/token/create/", async (req, res) => { 
  try {
  
    if(!req.body.platform) {
      const responseCode: number = 422;
      return res.status(responseCode).json( { message:  'Platform kitöltése kötelező.', code: responseCode } );
    }
    const platform: string = req.body.platform;
  
    const response = await controller.createToken(platform);
    if(response.error) {
      const error = response.error;
      const responseCode = error.code || 500;
      return res.status(responseCode).json(error);
    }

    if(!response.token) {
      throw new Error('Sikertelen token generálás. Hibakód: TRC#27');
    }

    return res.send(response);
  }
  catch(e) {
    const responseCode: number = 500;
    return res.status(responseCode).json( { message: `Váratlan hiba történt: ${e}`, code: responseCode } );
  }
});

router.patch('/token/renew', checkTokenDoesExists, async (req, res) => {
  try {
    // if(!req.body.token) {
    //   const responseCode: number = 422;
    //   return res.status(responseCode).json( { message:  'Token megadása kötelező.', code: responseCode } );
    // }
    
    const token = <string>req.headers.token;
    const response = await controller.renewToken(token);
    if(response.error) {
      const error = response.error;
      const responseCode = error.code || 500;
      return res.status(responseCode).json(error);
    }

    return res.status(200).json({ success: true, remaining: tokenConfig.maxRemainingToken });
  } 
  catch(e) {
    const responseCode: number = 500;
    return res.status(responseCode).json( { message: `Váratlan hiba történt: ${e}`, code: responseCode } );
  }
});

export default router;