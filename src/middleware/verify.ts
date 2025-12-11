import { NextFunction, Request, Response } from "express";

const verify = (req: Request, res: Response, next: NextFunction) => {
    const ID = false;
    if (ID) {
        throw new Error("net allowed");
    }
    next();
}

// probably this just an example, not needed in real code.