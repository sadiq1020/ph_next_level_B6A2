import jwt from "jsonwebtoken";
import config from "../config";
import { pool } from "../database/db";
const auth = (...roles) => {
    // console.log(roles);
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            // console.log(token);
            // check if there is no any token
            if (!token) {
                throw new Error("You are not authorized");
            }
            // verify the token
            const decoded = jwt.verify(token, config.jwtSecret);
            // console.log(decoded);
            // check if the user (token got from that user) is actually exist in DB
            const user = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `, [decoded.email]);
            if (!user) {
                throw new Error("User not found");
            }
            // console.log(decoded);
            // sending decoded (whoever's info in decoded) to req.user (by inserting in index.d.ts)
            req.user = decoded;
            // 
            if (roles.length && !roles.includes(decoded.role)) {
                // throw new Error("Your are not authorized")
                return res.status(500).json({
                    error: "Your are not authorized"
                });
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
};
export default auth;
