import { Request, Response } from "express";
import { userServices } from "./user.service";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await userServices.getAllUsersFromDB(); // req.body parameter will pass as payload to the service
        // console.log(result);
        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result.rows[0]
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const userController = {
    getAllUsers
}