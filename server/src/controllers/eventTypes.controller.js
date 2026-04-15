import { z } from "zod";
import { createEventType, deleteEventType, listEventTypes, updateEventType } from "../services/eventTypes.service.js";

const eventTypeSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and hyphens only."),
  description: z.string().max(280).optional(),
  durationMinutes: z.number().int().min(15).max(240),
  isActive: z.boolean().optional(),
});

export async function getEventTypesController(_request, response) {
  const data = await listEventTypes();
  response.json(data);
}

export async function createEventTypeController(request, response) {
  const payload = eventTypeSchema.parse(request.body);
  const data = await createEventType(payload);
  response.status(201).json(data);
}

export async function updateEventTypeController(request, response) {
  const payload = eventTypeSchema.parse(request.body);
  const data = await updateEventType(request.params.id, payload);
  response.json(data);
}

export async function deleteEventTypeController(request, response) {
  const data = await deleteEventType(request.params.id);
  response.json(data);
}
