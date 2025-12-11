import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

// get all users (only admin)
router.get('/', userController.getAllUsers)

export const userRoute = router;