import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../database/db";

const auth = (...roles: ("admin" | "customer")[]) => { // getting a role or  all roles by using (...) as an array
    // console.log(roles);

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;

            // check if there is no any token
            if (!token) {
                throw new Error("You are not authorized")
            }
            // console.log(token);

            // verify the token
            const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;
            // console.log(decoded);

            // check if the user (token got from that user) is actually exist in DB
            const user = await pool.query(
                `
            SELECT * FROM users WHERE email=$1
            `, [decoded.email]
            );

            if (!user) {
                throw new Error("User not found")
            }
            // console.log(decoded);

            // sending decoded (whoever's info in decoded) to req.user (by inserting in index.d.ts)
            req.user = decoded;

            // 
            if (roles.length && !roles.includes(decoded.role)) {
                // throw new Error("Your are not authorized")
                return res.status(500).json({
                    error: "Your are not authorized"
                })
            }

            next()


        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}

export default auth;