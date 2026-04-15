import { api } from "./client";

export function getBookings(type) {
  return api.get("/bookings", {
    params: { type },
  });
}

export function cancelBooking(id) {
  return api.patch(`/bookings/${id}/cancel`);
}
