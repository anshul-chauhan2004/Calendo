import { Router } from "express";
import {
  createEventTypeController,
  deleteEventTypeController,
  getEventTypesController,
  updateEventTypeController,
} from "../controllers/eventTypes.controller.js";

const router = Router();

router.get("/", getEventTypesController);
router.post("/", createEventTypeController);
router.put("/:id", updateEventTypeController);
router.delete("/:id", deleteEventTypeController);

export default router;
