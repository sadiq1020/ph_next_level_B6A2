import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.service";

// add a new vehicle (only admin)
const addVehicle = async (req: Request, res: Response) => {
    try {
        const result = await vehicleServices.addVehicleIntoDB(req.body);

        return res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: result.rows[0]
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get all vehicles (public)
const getAllVehicles = async (req: Request, res: Response) => {
    try {
        const result = await vehicleServices.getAllVehiclesFromDB();

        return res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: result.rows
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const vehicleController = {
    addVehicle,
    getAllVehicles
}