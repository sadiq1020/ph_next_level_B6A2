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

// get a single todo
const getSingleVehicle = async (req: Request, res: Response) => {
    try {
        const result = await vehicleServices.getSingleVehicleFromDB(req.params.vehicleId!);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Vehicle not found"
            });
        }
        res.status(200).json({
            success: true,
            message: 'Vehicle retrieved successfully',
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// update a vehicle
const updateVehicle = async (req: Request, res: Response) => {

    try {
        const result = await vehicleServices.updateVehicleIntoDB(req.body, req.params.vehicleId!);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle Not Found'
            });
        }
        res.status(200).json({
            success: true,
            data: result.rows[0],
            message: 'Vehicle updated successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// delete a vehicle (only admin)
const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const result = await vehicleServices.deleteVehicleFromDB(req.params.vehicleId!);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        } else
            res.status(200).json({
                success: true,
                data: null,
                message: 'Vehicle deleted successfully'
            });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const vehicleController = {
    addVehicle,
    getAllVehicles,
    getSingleVehicle,
    updateVehicle,
    deleteVehicle
}