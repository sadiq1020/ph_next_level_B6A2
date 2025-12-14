import { userServices } from "./user.service";
// get all users (only admin)
const getAllUsers = async (req, res) => {
    try {
        const result = await userServices.getAllUsersFromDB(); // req.body parameter will pass as payload to the service
        // console.log(result);
        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result.rows
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// (put) can edit all users by admin or own user by customer (admin and specific logged in user)
const updateUsers = async (req, res) => {
    // console.log(req.body);
    try {
        const result = await userServices.updateUsersIntoDB(req.body, req.params.userId, req.user);
        // console.log(result);
        return res.status(200).json({
            success: true,
            message: "Users updated successfully",
            data: result.rows
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// delete user (only admin)
const deleteUser = async (req, res) => {
    try {
        await userServices.deleteUserFromDB(req.params.userId);
        return res.status(200).json({
            success: true,
            data: null,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const userController = {
    getAllUsers,
    updateUsers,
    deleteUser
};
