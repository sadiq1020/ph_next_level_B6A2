import { pool } from "../../database/db";

const getAllUsersFromDB = async () => {
    // do not need any payload for the get method

    const result = await pool.query(
        `
        SELECT id, name, email, phone, role FROM users
        `
    ); // excluding password, so that no one can (even admin) see the users' password

    return result;
}

export const userServices = {
    getAllUsersFromDB
}