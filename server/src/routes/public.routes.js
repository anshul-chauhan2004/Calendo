import { Router } from "express";
import {
  createPublicBookingController,
  getPublicBookingController,
  getPublicEventController,
  getPublicSlotsController,
} from "../controllers/public.controller.js";

const router = Router();

router.get("/event-types/:slug", getPublicEventController);
router.get("/event-types/:slug/slots", getPublicSlotsController);
router.get("/event-types/:slug/bookings/:bookingId", getPublicBookingController);
router.post("/event-types/:slug/book", createPublicBookingController);

export default router;
