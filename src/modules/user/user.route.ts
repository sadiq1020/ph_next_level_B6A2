import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router();

// get all users (only admin)
router.get('/', auth("admin"), userController.getAllUsers)

export const userRoute = router;