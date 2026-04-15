import { api } from "./client";

export function getAvailability() {
  return api.get("/availability");
}

export function updateAvailability(payload) {
  return api.put("/availability", payload);
}
