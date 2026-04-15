import { z } from "zod";
import { getAvailability, updateAvailability } from "../services/availability.service.js";

const availabilitySchema = z.object({
  timezone: z.string().min(1),
  rules: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    }),
  ),
});

export async function getAvailabilityController(_request, response) {
  const data = await getAvailability();
  response.json(data);
}

export async function updateAvailabilityController(request, response) {
  const payload = availabilitySchema.parse(request.body);
  const data = await updateAvailability(payload);
  response.json(data);
}
