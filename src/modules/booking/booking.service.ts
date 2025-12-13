import { pool } from "../../database/db";
import { autoUpdateExpiredBookings } from "../../helpers/autoUpdateBookings";

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

    // First call this function from helper folder to Automatically update expired bookings before fetching booking data
    await autoUpdateExpiredBookings();

    // If user is an admin -> get ALL bookings
    // new concept => here tables -> bookings = b, users = u, vehicles = v [table name alias or nickname] 
    // new concept => JOIN method
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
    // here tables -> bookings = b, vehicles = v, 
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

//  update booking business logics
const updateBookingIntoDB = async (payload: Record<string, unknown>, bookingId: string, authenticatedUser: any) => {
    const { status } = payload;

    // Use again transaction for consistency (used bookingIntoDB business logics)
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Step 1: Get all the booking details
        const bookingResult = await client.query(
            `SELECT bookings.*, vehicles.availability_status as vehicle_status
             FROM bookings
             JOIN vehicles ON bookings.vehicle_id = vehicles.id
             WHERE bookings.id = $1`,
            [bookingId]
        ); //  here the first line means -> Give me all the columns from the bookings table + just the availability_status (that named here vehicle_status) from the vehicles table

        if (bookingResult.rows.length === 0) {
            throw new Error("Booking not found");
        }

        const booking = bookingResult.rows[0];

        // Step 2: Role-based validation and actions

        // CUSTOMER: Can only cancel their OWN bookings BEFORE start date
        if (authenticatedUser.role === 'customer') {

            // Check if customer owns this booking
            if (booking.customer_id !== authenticatedUser.id) {
                throw new Error("You can only cancel your own bookings");
            }

            // Check if trying to cancel (customers can only cancel, not mark as returned)
            if (status !== 'cancelled') {
                throw new Error("Customers can only cancel bookings");
            }

            // Check if booking is already cancelled or returned
            if (booking.status === 'cancelled') {
                throw new Error("Booking is already cancelled");
            }

            if (booking.status === 'returned') {
                throw new Error("Cannot cancel a returned booking");
            }

            // Check if the cancel attempt is after the start date
            const startDate = new Date(booking.rent_start_date);
            const now = new Date();

            if (startDate <= now) {
                throw new Error("Cannot cancel booking after the start date");
            }

            // Update booking status to cancelled
            const updatedBooking = await client.query(
                `UPDATE bookings 
                 SET status = $1 
                 WHERE id = $2 
                 RETURNING *`,
                ['cancelled', bookingId]
            );

            // Update vehicle status back to available
            await client.query(
                `UPDATE vehicles 
                 SET availability_status = $1
                 WHERE id = $2`,
                ['available', booking.vehicle_id]
            );

            await client.query('COMMIT');

            return { booking: updatedBooking.rows[0], action: 'cancelled' };
        }

        // ADMIN: Can mark bookings as "returned"
        if (authenticatedUser.role === 'admin') {

            // Check if booking is already returned
            if (booking.status === 'returned') {
                throw new Error("Booking is already marked as returned");
            }

            // Check if booking was cancelled
            if (booking.status === 'cancelled') {
                throw new Error("cannot mark a cancelled booking as returned");
            }

            // Update booking status to returned
            const updatedBooking = await client.query(
                `UPDATE bookings 
                 SET status = $1
                 WHERE id = $2 
                 RETURNING *`,
                ['returned', bookingId]
            );

            // Update vehicle status back to available
            const updatedVehicle = await client.query(
                `UPDATE vehicles 
                 SET availability_status = $1
                 WHERE id = $2
                 RETURNING availability_status`,
                ['available', booking.vehicle_id]
            );

            await client.query('COMMIT');

            return { booking: updatedBooking.rows[0], vehicle: updatedVehicle.rows[0], action: 'returned' };
        }

        throw new Error("Unauthorized action");

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export const bookingService = {
    bookingIntoDB,
    getBookingFromDB,
    updateBookingIntoDB
}