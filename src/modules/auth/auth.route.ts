import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// signup -> create a new user => /api/v1/auth/signup
router.post('/signup', authController.signUpUser)

// signin -> create a new user => /api/v1/auth/signin
router.post('/signin', authController.signInUser)

export const authRoute = router;