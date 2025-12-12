import { Request, Response } from "express";
import { userServices } from "./user.service";

// get all users (only admin)
const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await userServices.getAllUsersFromDB(); // req.body parameter will pass as payload to the service
        // console.log(result);
        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// (put) can edit all users by admin or own user by customer (admin and specific logged in user)
const updateUsers = async (req: Request, res: Response) => {

    // console.log(req.body);
    try {
        const result = await userServices.updateUsersFromDB(req.body, req.params.userId!, req.user);
        // console.log(result);
        return res.status(200).json({
            success: true,
            message: "Users updated successfully",
            data: result
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const userController = {
    getAllUsers,
    updateUsers
}