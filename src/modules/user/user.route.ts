import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

// create new user with signup 
router.post('/auth/signup', userController.createUser)

export const userRoute = router;