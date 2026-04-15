import { api } from "./client";

export function getEventTypes() {
  return api.get("/event-types");
}

export function createEventType(payload) {
  return api.post("/event-types", payload);
}

export function updateEventType(id, payload) {
  return api.put(`/event-types/${id}`, payload);
}

export function deleteEventType(id) {
  return api.delete(`/event-types/${id}`);
}
