import { Request, Response } from "express";
import { bookingService } from "./booking.service";

// add a new `booking` (admin and customer)
const addBooking = async (req: Request, res: Response) => {
    try {
        const result = await bookingService.bookingIntoDB(req.body);

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result.rows[0]
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get all (admin) or specific booking/s (customer)
const getBooking = async (req: Request, res: Response) => {
    try {
        const result = await bookingService.getBookingFromDB(req.user); // req.body parameter will pass as payload to the service
        // console.log(result);
        return res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: result.rows
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const bookingController = {
    addBooking,
    getBooking
}