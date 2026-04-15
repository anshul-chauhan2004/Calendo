import { Router } from "express";
import { getAvailabilityController, updateAvailabilityController } from "../controllers/availability.controller.js";

const router = Router();

router.get("/", getAvailabilityController);
router.put("/", updateAvailabilityController);

export default router;
