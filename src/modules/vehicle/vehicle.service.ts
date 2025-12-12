import { pool } from "../../database/db";

// add a new vehicle (admin only)
const addVehicleIntoDB = async (payload: Record<string, unknown>) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;

    const result = await pool.query(
        `INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );

    return result;
}

// getAllVehicles business logics
const getAllVehiclesFromDB = async () => {
    const result = await pool.query(
        `
        SELECT vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles
        `
    );

    return result;
}

// get a single vehicle business logics
const getSingleVehicleFromDB = async (id: string) => {
    const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id])
    return result
}

// update a vehicle business logics
const updateVehicleIntoDB = async (payload: Record<string, unknown>, vehicleId: string) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;

    const result = await pool.query(`UPDATE vehicles SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5 WHERE id = $6 RETURNING *`, [vehicle_name, type, registration_number, daily_rent_price, availability_status, vehicleId])
    return result;
}

// delete a vehicle business logics
const deleteVehicleFromDB = async (vehicleId: string) => {
    const result = await pool.query(`DELETE FROM vehicles WHERE id = $1 RETURNING *`, [vehicleId])
    return result;
}

export const vehicleServices = {
    addVehicleIntoDB,
    getAllVehiclesFromDB,
    getSingleVehicleFromDB,
    updateVehicleIntoDB,
    deleteVehicleFromDB
}