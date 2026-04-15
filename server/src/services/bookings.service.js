import prismaPkg from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { getDefaultUserOrThrow } from "../utils/defaultUser.js";

const { BookingStatus } = prismaPkg;

export async function listMeetings(type) {
  const user = await getDefaultUserOrThrow();
  const now = new Date();

  return prisma.booking.findMany({
    where: {
      hostUserId: user.id,
      ...(type === "past"
        ? {
            OR: [
              {
                status: BookingStatus.CANCELLED,
              },
              {
                status: BookingStatus.SCHEDULED,
                startTimeUtc: { lt: now },
              },
            ],
          }
        : {
            status: BookingStatus.SCHEDULED,
            startTimeUtc: { gte: now },
          }),
    },
    include: {
      eventType: true,
      hostUser: {
        select: {
          timezone: true,
        },
      },
    },
    orderBy: { startTimeUtc: type === "past" ? "desc" : "asc" },
  });
}

export async function cancelMeeting(id) {
  const user = await getDefaultUserOrThrow();

  const existing = await prisma.booking.findFirst({
    where: {
      id,
      hostUserId: user.id,
    },
  });

  if (!existing) {
    throw new AppError(404, "Meeting not found.");
  }

  return prisma.booking.update({
    where: { id },
    data: {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
    },
    include: {
      eventType: true,
    },
  });
}
