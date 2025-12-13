import { Router } from "express";
import auth from "../../middleware/auth";
import { bookingController } from "./booking.controller";

const router = Router();

router.post('/', auth("admin", "customer"), bookingController.addBooking);
router.get('/', auth("admin", "customer"), bookingController.getBooking);


export const bookingRoute = router;