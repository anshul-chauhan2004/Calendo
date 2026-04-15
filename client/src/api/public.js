import { api } from "./client";

export function getPublicEvent(slug) {
  return api.get(`/public/event-types/${slug}`);
}

export function getPublicSlots(slug, date) {
  return api.get(`/public/event-types/${slug}/slots`, {
    params: { date },
  });
}

export function getPublicBooking(slug, bookingId) {
  return api.get(`/public/event-types/${slug}/bookings/${bookingId}`);
}

export function createPublicBooking(slug, payload) {
  return api.post(`/public/event-types/${slug}/book`, payload);
}
