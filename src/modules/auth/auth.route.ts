import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// authentication -> signup -> create a new user => /api/v1/auth/signup
router.post('/signup', authController.signUpUser)

export const authRoute = router;