import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function formatMeetingTime(dateValue, timezone) {
  return formatInTimeZone(parseISO(dateValue), timezone, "EEE, MMM d • hh:mm a");
}

export function formatLongDate(dateValue, timezone) {
  return formatInTimeZone(parseISO(dateValue), timezone, "EEEE, MMMM d, yyyy");
}

export function formatClockTime(dateValue, timezone) {
  return formatInTimeZone(parseISO(dateValue), timezone, "hh:mm a");
}

export function formatShortDate(dateValue, timezone) {
  return formatInTimeZone(parseISO(dateValue), timezone, "EEE, MMM d");
}

export function formatTimeRange(startTime, endTime, timezone) {
  return `${formatClockTime(startTime, timezone)} - ${formatClockTime(endTime, timezone)}`;
}
