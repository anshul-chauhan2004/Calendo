import { addMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export function getDayOfWeekInTimezone(dateKey, timezone) {
  const noonInTimezone = fromZonedTime(`${dateKey}T12:00:00`, timezone);
  const isoDay = Number(formatInTimeZone(noonInTimezone, timezone, "i"));
  return isoDay % 7;
}

export function getUtcDateForTimezoneTime(dateKey, time, timezone) {
  return fromZonedTime(`${dateKey}T${time}:00`, timezone);
}

export function getDateKeyInTimezone(date, timezone) {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

export function formatSlotForClient(date, timezone) {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

export function buildSlots({ dateKey, startTime, endTime, durationMinutes, timezone }) {
  const slots = [];
  const windowStart = getUtcDateForTimezoneTime(dateKey, startTime, timezone);
  const windowEnd = getUtcDateForTimezoneTime(dateKey, endTime, timezone);

  let cursor = windowStart;

  while (addMinutes(cursor, durationMinutes) <= windowEnd) {
    const slotStart = cursor;
    const slotEnd = addMinutes(slotStart, durationMinutes);

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
    });

    cursor = slotEnd;
  }

  return slots;
}

export function slotsOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return firstStart < secondEnd && secondStart < firstEnd;
}
