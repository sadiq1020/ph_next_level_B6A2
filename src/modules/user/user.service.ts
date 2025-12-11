import { pool } from "../../database/db";

const getAllUsersFromDB = async () => {
    // do not need any payload for the get method

    const result = await pool.query(
        `
        SELECT * FROM users
        `
    );

    return result;
}

export const userServices = {
    getAllUsersFromDB
}