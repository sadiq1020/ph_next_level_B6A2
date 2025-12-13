import { pool } from "../database/db";

export const autoUpdateExpiredBookings = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get current date
        const now = new Date();

        // Find all active bookings where rent_end_date has passed
        const expiredBookings = await client.query(
            `SELECT id, vehicle_id 
             FROM bookings 
             WHERE status = 'active' 
             AND rent_end_date < $1`,
            [now]
        );

        // If no expired bookings, return only
        if (expiredBookings.rows.length === 0) {
            await client.query('COMMIT');
            return;
        }

        // If any expired bookings found Update all expired bookings to "returned"
        await client.query(
            `UPDATE bookings 
             SET status = 'returned'
             WHERE status = 'active' 
             AND rent_end_date < $1`,
            [now]
        );

        // Get the vehicle IDs to update with availability_status = availabe
        const vehicleIds = expiredBookings.rows.map(row => row.vehicle_id);

        // Update all vehicles to "available"
        if (vehicleIds.length > 0) {
            await client.query(
                `UPDATE vehicles 
                 SET availability_status = 'available'
                 WHERE id = ANY($1)`,
                [vehicleIds]
            );
        }

        await client.query('COMMIT');

    } catch (error) {
        await client.query('ROLLBACK');
        // console.log(error);
    } finally {
        client.release();
    }
};