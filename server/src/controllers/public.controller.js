import { z } from "zod";
import {
  createPublicBooking,
  getPublicBookingById,
  getPublicEventBySlug,
  getPublicSlots,
} from "../services/public.service.js";

const slotQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const createBookingSchema = z.object({
  startTime: z.string().datetime({ offset: true }),
  inviteeName: z.string().min(2).max(100),
  inviteeEmail: z.string().email(),
});

export async function getPublicEventController(request, response) {
  const data = await getPublicEventBySlug(request.params.slug);
  response.json(data);
}

export async function getPublicSlotsController(request, response) {
  const query = slotQuerySchema.parse(request.query);
  const data = await getPublicSlots(request.params.slug, query.date);
  response.json(data);
}

export async function getPublicBookingController(request, response) {
  const data = await getPublicBookingById(request.params.slug, request.params.bookingId);
  response.json(data);
}

export async function createPublicBookingController(request, response) {
  const payload = createBookingSchema.parse(request.body);
  const data = await createPublicBooking({
    slug: request.params.slug,
    ...payload,
  });
  response.status(201).json(data);
}
