import { Request, Response } from "express";
import { authServices } from "./auth.service";

const signUpUser = async (req: Request, res: Response) => {
    try {
        const result = await authServices.signUpUserIntoDB(req.body); // req.body parameter will pass as payload to the service
        // console.log(result);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const authController = {
    signUpUser
}