import { z } from "zod";
import { cancelMeeting, listMeetings } from "../services/bookings.service.js";

const querySchema = z.object({
  type: z.enum(["upcoming", "past"]).default("upcoming"),
});

export async function getBookingsController(request, response) {
  const query = querySchema.parse(request.query);
  const data = await listMeetings(query.type);
  response.json(data);
}

export async function cancelBookingController(request, response) {
  const data = await cancelMeeting(request.params.id);
  response.json(data);
}
