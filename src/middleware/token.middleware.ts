import { NextFunction, Request, Response } from "express";
import { Token, platformTypes } from "../entity/token.entity";
import { controller } from "../routes/token.router";

export const checkTokenDoesExists = async ( req: Request, res: Response, next: NextFunction ) => {
    const headers = req.headers;
    let tokenDoesExists: boolean = true;
    if(!headers.token) {
        tokenDoesExists = false;
    }
    
    const token = <string>headers.token;
    const tokenIsValid = await controller.doesTokenExists(token, false);
    if(!tokenIsValid) {
        tokenDoesExists = false;
    }

    if(!tokenDoesExists) {
        const responseCode: number = 403;
        return res.status(responseCode).json( { message: `Invalid token header.`, code: responseCode } );
    }

    next();
};

export const checkTokenIsValid = async ( req: Request, res: Response, next: NextFunction ) => {
    const headers = req.headers;
    let tokenDoesExists: boolean = true;
    if(!headers.token) {
        tokenDoesExists = false;
    }
    
    const token = <string>headers.token;
    const tokenIsValid = await controller.doesTokenExists(token, true);
    if(!tokenIsValid) {
        tokenDoesExists = false;
    }

    if(!tokenDoesExists) {
        const responseCode: number = 403;
        return res.status(responseCode).json( { message: `Token does not exist or is not valid.`, code: responseCode } );
    }

    next();
};