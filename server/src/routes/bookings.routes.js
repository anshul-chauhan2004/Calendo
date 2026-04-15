import { Router } from "express";
import { cancelBookingController, getBookingsController } from "../controllers/bookings.controller.js";

const router = Router();

router.get("/", getBookingsController);
router.patch("/:id/cancel", cancelBookingController);

export default router;
