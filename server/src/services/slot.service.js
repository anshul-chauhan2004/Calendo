import { addDays } from "date-fns";
import prismaPkg from "@prisma/client";
import {
  buildSlots,
  formatSlotForClient,
  getDayOfWeekInTimezone,
  getUtcDateForTimezoneTime,
  slotsOverlap,
} from "../utils/time.js";

const { BookingStatus } = prismaPkg;

function getNextDateKey(dateKey) {
  const nextDate = new Date(`${dateKey}T00:00:00.000Z`);
  return addDays(nextDate, 1).toISOString().slice(0, 10);
}

export async function getAvailableSlotsForDate({ prismaClient, eventType, dateKey, timezone }) {
  const dayOfWeek = getDayOfWeekInTimezone(dateKey, timezone);

  const rule = await prismaClient.availabilityRule.findFirst({
    where: {
      userId: eventType.userId,
      dayOfWeek,
    },
  });

  if (!rule) {
    return {
      timezone,
      slots: [],
      slotWindows: [],
    };
  }

  const dayStartUtc = getUtcDateForTimezoneTime(dateKey, "00:00", timezone);
  const nextDayUtc = getUtcDateForTimezoneTime(getNextDateKey(dateKey), "00:00", timezone);

  const bookings = await prismaClient.booking.findMany({
    where: {
      hostUserId: eventType.userId,
      status: BookingStatus.SCHEDULED,
      startTimeUtc: {
        lt: nextDayUtc,
      },
      endTimeUtc: {
        gt: dayStartUtc,
      },
    },
  });

  const candidateSlots = buildSlots({
    dateKey,
    startTime: rule.startTime,
    endTime: rule.endTime,
    durationMinutes: eventType.durationMinutes,
    timezone,
  });

  const availableSlots = candidateSlots.filter((slot) => {
    return !bookings.some((booking) =>
      slotsOverlap(slot.startTime, slot.endTime, booking.startTimeUtc, booking.endTimeUtc),
    );
  });

  return {
    timezone,
    slots: availableSlots.map((slot) => formatSlotForClient(slot.startTime, timezone)),
    slotWindows: availableSlots,
  };
}
