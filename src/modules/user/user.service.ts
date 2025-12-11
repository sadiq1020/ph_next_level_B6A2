import bcrypt from "bcryptjs";
import { pool } from "../../database/db";

const createUserIntoDB = async (payload: Record<string, unknown>) => {
    const { name, email, password, phone, role } = payload; // instead of req.body, it will come as payload from controller

    const hashPassword = await bcrypt.hash(password as string, 12);

    const result = await pool.query(
        `INSERT INTO users(name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [name, email, hashPassword, phone, role]
    );

    // delete password before return the result
    delete result.rows[0].password;
    return result;
}

export const userServices = {
    createUserIntoDB
}