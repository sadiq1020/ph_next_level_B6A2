import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.service";

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

export const vehicleController = {
    addVehicle,
}