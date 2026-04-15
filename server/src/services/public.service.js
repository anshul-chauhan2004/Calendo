import { addMinutes, parseISO } from "date-fns";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { getDateKeyInTimezone } from "../utils/time.js";
import { getAvailableSlotsForDate } from "./slot.service.js";

export async function getPublicEventBySlug(slug) {
  const eventType = await prisma.eventType.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          timezone: true,
        },
      },
    },
  });

  if (!eventType || !eventType.isActive) {
    throw new AppError(404, "Public event type not found.");
  }

  return {
    id: eventType.id,
    name: eventType.name,
    slug: eventType.slug,
    description: eventType.description,
    durationMinutes: eventType.durationMinutes,
    hostName: eventType.user.name,
    timezone: eventType.user.timezone,
    publicUrl: `${env.clientUrl}/book/${eventType.slug}`,
  };
}

export async function getPublicSlots(slug, dateKey) {
  const eventType = await prisma.eventType.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          timezone: true,
        },
      },
    },
  });

  if (!eventType || !eventType.isActive) {
    throw new AppError(404, "Public event type not found.");
  }

  const slotData = await getAvailableSlotsForDate({
    prismaClient: prisma,
    eventType,
    dateKey,
    timezone: eventType.user.timezone,
  });

  return {
    date: dateKey,
    timezone: eventType.user.timezone,
    slots: slotData.slots,
  };
}

export async function getPublicBookingById(slug, bookingId) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      eventType: {
        slug,
      },
    },
    include: {
      eventType: {
        include: {
          user: {
            select: {
              name: true,
              timezone: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new AppError(404, "Booking confirmation not found.");
  }

  return {
    id: booking.id,
    inviteeName: booking.inviteeName,
    inviteeEmail: booking.inviteeEmail,
    startTimeUtc: booking.startTimeUtc,
    endTimeUtc: booking.endTimeUtc,
    status: booking.status,
    eventType: {
      id: booking.eventType.id,
      name: booking.eventType.name,
      slug: booking.eventType.slug,
      description: booking.eventType.description,
      durationMinutes: booking.eventType.durationMinutes,
      hostName: booking.eventType.user.name,
      timezone: booking.eventType.user.timezone,
    },
  };
}

export async function createPublicBooking(payload) {
  const eventType = await prisma.eventType.findUnique({
    where: { slug: payload.slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          timezone: true,
        },
      },
    },
  });

  if (!eventType || !eventType.isActive) {
    throw new AppError(404, "Public event type not found.");
  }

  const requestedStart = parseISO(payload.startTime);
  const requestedEnd = addMinutes(requestedStart, eventType.durationMinutes);
  const dateKey = getDateKeyInTimezone(requestedStart, eventType.user.timezone);

  const slotData = await getAvailableSlotsForDate({
    prismaClient: prisma,
    eventType,
    dateKey,
    timezone: eventType.user.timezone,
  });

  const matchingSlot = slotData.slotWindows.find(
    (slot) => slot.startTime.getTime() === requestedStart.getTime(),
  );

  if (!matchingSlot) {
    throw new AppError(409, "This time slot is no longer available.");
  }

  return prisma.$transaction(
    async (tx) => {
      const overlappingBooking = await tx.booking.findFirst({
        where: {
          eventTypeId: eventType.id,
          status: "SCHEDULED",
          startTimeUtc: {
            lt: requestedEnd,
          },
          endTimeUtc: {
            gt: requestedStart,
          },
        },
      });

      if (overlappingBooking) {
        throw new AppError(409, "This time slot is no longer available.");
      }

      return tx.booking.create({
        data: {
          eventTypeId: eventType.id,
          hostUserId: eventType.user.id,
          inviteeName: payload.inviteeName,
          inviteeEmail: payload.inviteeEmail,
          startTimeUtc: requestedStart,
          endTimeUtc: requestedEnd,
        },
        include: {
          eventType: {
            include: {
              user: {
                select: {
                  name: true,
                  timezone: true,
                },
              },
            },
          },
        },
      });
    },
    {
      timeout: 15000,
    },
  );
}
