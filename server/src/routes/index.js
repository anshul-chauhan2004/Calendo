import { Router } from "express";
import availabilityRoutes from "./availability.routes.js";
import bookingsRoutes from "./bookings.routes.js";
import eventTypesRoutes from "./eventTypes.routes.js";
import publicRoutes from "./public.routes.js";

const router = Router();

router.use("/event-types", eventTypesRoutes);
router.use("/availability", availabilityRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/public", publicRoutes);

export default router;
