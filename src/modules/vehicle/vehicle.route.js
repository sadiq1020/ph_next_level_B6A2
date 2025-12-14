import { Router } from "express";
import { vehicleController } from "./vehicle.controller";
import auth from "../../middleware/auth";
const router = Router();
router.post('/', auth("admin"), vehicleController.addVehicle);
router.get('/', vehicleController.getAllVehicles);
router.get('/:vehicleId', vehicleController.getSingleVehicle);
router.put('/:vehicleId', auth("admin"), vehicleController.updateVehicle);
router.delete('/:vehicleId', auth("admin"), vehicleController.deleteVehicle); // need to update: only if no active bookings 
export const vehicleRoute = router;
