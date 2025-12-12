import { pool } from "../../database/db";

// getAllUsers business logics
const getAllUsersFromDB = async () => {
    // do not need any payload for the get method

    const result = await pool.query(
        `
        SELECT id, name, email, phone, role FROM users
        `
    ); // excluding password, so that no one can (even admin) see the users' password

    return result;
}

// update a single user or all users business logics
const updateUsersIntoDB = async (payload: Record<string, unknown>, userId: string, authenticatedUser: any) => {
    const { name, email, phone, role } = payload;

    // getting the user from db whoever trying to sign in
    // const user = await pool.query(`
    //     SELECT * FROM users WHERE email=$1
    //     `, [email])

    // if (user.rows[0].role === 'admin') {
    //     const result = await pool.query(
    //         `
    //     UPDATE users SET name = $1, email = $2, phone = $3, role = $4 WHERE id = $5 RETURNING *
    //     `, [name, email, phone, role, userId])

    //     return result;
    // }

    // update if the authenticated user is an "admin"
    if (authenticatedUser.role === 'admin') {
        const result = await pool.query(
            `
            UPDATE users SET name = $1, email = $2, phone = $3, role = $4 
             WHERE id = $5 RETURNING id, name, email, phone, role
             `, [name, email, phone, role, userId]);

        if (result.rows.length === 0) {
            throw new Error("User is not found!");
        }

        return result;
    }

    // update only his/her own profile, if the authenticated user is a "customer"
    if (authenticatedUser.role === 'customer') {

        // Check if the customer is trying to update their own profile
        if (authenticatedUser.id !== parseInt(userId)) {
            throw new Error("You can only update your own profile!");
        }

        // Customer can change all except their own role 
        const result = await pool.query(
            `UPDATE users SET name = $1, email = $2, phone = $3 
             WHERE id = $4 RETURNING id, name, email, phone, role`,
            [name, email, phone, authenticatedUser.id]
        );

        if (result.rows.length === 0) {
            throw new Error("User not found");
        }

        return result;
    }

    throw new Error("Unauthorized attempt");
}

// delete a user business logics
const deleteUserFromDB = async (id: string) => {
    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id])
    return result;
}

export const userServices = {
    getAllUsersFromDB,
    updateUsersIntoDB,
    deleteUserFromDB
}