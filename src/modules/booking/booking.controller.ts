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

// update a booking (cancel or mark as returned)
const updateBooking = async (req: Request, res: Response) => {
    try {
        const result = await bookingService.updateBookingIntoDB(req.body, req.params.bookingId!, req.user);

        // Different messages based on action  
        // return { booking: updatedBooking.rows[0], action: 'cancelled' };
        //  return { booking: updatedBooking.rows[0], vehicle: updatedVehicle.rows[0], action: 'returned' };
        let message = "";
        let responseData: any = result.booking;

        if (result.action === 'cancelled') {
            message = "Booking cancelled successfully";
        } else if (result.action === 'returned') {
            message = "Booking marked as returned. Vehicle is now available";
            // Include vehicle status in response for admin
            responseData = {
                ...result.booking,
                vehicle: {
                    availability_status: result.vehicle.availability_status
                }
            };
        }

        return res.status(200).json({
            success: true,
            message: message,
            data: responseData
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const bookingController = {
    addBooking,
    getBooking,
    updateBooking
}