import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router();

// get all users (only admin)
router.get('/', auth("admin"), userController.getAllUsers);
router.put('/:userId', auth("admin"), userController.updateUsers);

export const userRoute = router;