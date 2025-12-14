import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
const router = Router();
router.get('/', auth("admin"), userController.getAllUsers);
router.put('/:userId', auth("admin", "customer"), userController.updateUsers);
router.delete('/:userId', auth("admin"), userController.deleteUser); // need to update: only if no active bookings exist
export const userRoute = router;
