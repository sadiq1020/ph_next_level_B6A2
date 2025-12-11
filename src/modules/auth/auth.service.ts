import bcrypt from "bcryptjs";
import { pool } from "../../database/db";
import jwt from "jsonwebtoken";
import config from "../../config";

// signup business logics: 
const signUpUserIntoDB = async (payload: Record<string, unknown>) => {
    const { name, email, password, phone, role } = payload; // instead of req.body, it will come as payload from controller

    const hashPassword = await bcrypt.hash(password as string, 12);

    const result = await pool.query(
        `INSERT INTO users(name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [name, email, hashPassword, phone, role]
    );

    // delete password before return the result
    delete result.rows[0].password;
    return result;
}

// signin business logics
const signInUserIntoDB = async (payload: Record<string, unknown>) => { // or parameter like these -> email: string, password: string (same)
    const { email, password } = payload;

    // getting the user from db whoever trying to sign in
    const user = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email])

    // if user is not found
    if (user.rows.length === 0) {
        throw new Error("User not found");
    }

    // checking the inserted password from user is matched with the original password
    const matchPassword = await bcrypt.compare(password as string, user.rows[0].password);

    // if the password is not matched
    if (!matchPassword) {
        throw new Error("invalid credential");
    };

    // if password matches, we will create jwt for that user
    const jwtPayload = {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role
    }

    const token = jwt.sign(jwtPayload, config.jwtSecret as string, { expiresIn: "7d" })

    // delete the password from response, before sending response to client
    delete user.rows[0].password;

    return { token, user: user.rows[0] }
}



export const authServices = {
    signUpUserIntoDB,
    signInUserIntoDB
}