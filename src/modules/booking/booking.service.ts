import { pool } from "../../database/db";

// add a booking business logics
const bookingIntoDB = async (payload: Record<string, unknown>) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

    // New Concept: Get ONE specific database worker for multiple tasks (for consistency)
    const client = await pool.connect();

    try {
        // "Start recording! Don't save anything yet."
        await client.query('BEGIN'); // -> It means -> before commit or release function is called, the tasks won't be saved

        // Step 1: Get vehicle details
        const vehicleResult = await client.query(
            `SELECT id, vehicle_name, daily_rent_price, availability_status 
             FROM vehicles 
             WHERE id = $1`,
            [vehicle_id]
        );

        // check if the vehicle is in the db
        if (vehicleResult.rows.length === 0) {
            throw new Error("Vehicle is not found");
        }

        const vehicle = vehicleResult.rows[0];

        // Step 2: Check if the vehicle status is available in DB
        if (vehicle.availability_status !== 'available') {
            throw new Error(`Vehicle "${vehicle.vehicle_name}" is not available`);
        }

        // Step 3: Calculate dates
        const startDate = new Date(rent_start_date as string);
        const endDate = new Date(rent_end_date as string);

        if (startDate >= endDate) {
            throw new Error("End date must be after start date");
        }

        if (startDate < new Date()) {
            throw new Error("Start date cannot be in the past");
        }

        // Step 4: Calculate number of days
        // getTime() gives dates in  milliseconds
        // Difference = milliseconds between the two dates
        const timeDifference = endDate.getTime() - startDate.getTime();

        // Convert milliseconds to days:
        // 1000 ms = 1 second
        // 60 seconds = 1 minute
        // 60 minutes = 1 hour
        // 24 hours = 1 day
        // Math.ceil rounds UP (2.1 days becomes 3 days)
        const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        // Step 5: Calculate total price
        const total_price = vehicle.daily_rent_price * numberOfDays;

        // Step 6: Create booking
        const bookingResult = await client.query(
            `INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, 'active']
        );

        // Step 7: Update vehicle status in vehicle table in db
        await client.query(
            `UPDATE vehicles 
             SET availability_status = $1, updated_at = NOW() 
             WHERE id = $2`,
            ['booked', vehicle_id]
        );

        //  "If everything worked, save all changes permanently."
        await client.query('COMMIT');

        return bookingResult;

    } catch (error) {
        //  "if any step fails, ROLLBACK will undo every works till that step"
        await client.query('ROLLBACK');
        throw error;

    } finally {
        //  "Release the worker back to the pool"
        client.release();
    }
}

// get all bookings or a customer's booking/s business logics
const getBookingFromDB = async (authenticatedUser: any) => {

    // If user is an admin -> get ALL bookings
    if (authenticatedUser.role === 'admin') {
        const result = await pool.query(
            `SELECT 
                b.id, 
                b.customer_id, 
                b.vehicle_id, 
                b.rent_start_date, 
                b.rent_end_date, 
                b.total_price, 
                b.status,
                u.name as customer_name,
                u.email as customer_email,
                v.vehicle_name,
                v.type as vehicle_type
             FROM bookings b
             JOIN users u ON b.customer_id = u.id
             JOIN vehicles v ON b.vehicle_id = v.id
             ORDER BY b.created_at DESC`
        );
        return result;
    }

    // If user is a customer -> get only own booking/s
    if (authenticatedUser.role === 'customer') {
        const result = await pool.query(
            `SELECT 
                b.id, 
                b.customer_id, 
                b.vehicle_id, 
                b.rent_start_date, 
                b.rent_end_date, 
                b.total_price, 
                b.status,
                v.vehicle_name,
                v.type as vehicle_type,
                v.registration_number
             FROM bookings b
             JOIN vehicles v ON b.vehicle_id = v.id
             WHERE b.customer_id = $1
             ORDER BY b.created_at DESC`,
            [authenticatedUser.id]
        );
        return result;
    }

    throw new Error("Unauthorized access");
}

export const bookingService = {
    bookingIntoDB,
    getBookingFromDB
}