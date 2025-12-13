import { Request, Response } from "express";
import { bookingService } from "./booking.service";

// add a new vehicle (only admin)
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

export const bookingController = {
    addBooking
}