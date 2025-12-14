import { authServices } from "./auth.service";
// signup new user
const signUpUser = async (req, res) => {
    try {
        const result = await authServices.signUpUserIntoDB(req.body); // req.body parameter will pass as payload to the service
        // console.log(result);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// signin new user with jwt
const signInUser = async (req, res) => {
    try {
        const result = await authServices.signInUserIntoDB(req.body); // req.body parameter will pass as payload to the service
        return res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: result
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const authController = {
    signUpUser,
    signInUser
};
