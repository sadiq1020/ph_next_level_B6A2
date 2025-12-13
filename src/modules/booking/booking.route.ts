import { Router } from "express";
import auth from "../../middleware/auth";
import { bookingController } from "./booking.controller";

const router = Router();

router.post('/', auth("admin", "customer"), bookingController.addBooking);


export const bookingRoute = router;