import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { getDefaultUserOrThrow } from "../utils/defaultUser.js";

export async function listEventTypes() {
  const user = await getDefaultUserOrThrow();

  return prisma.eventType.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function createEventType(payload) {
  const user = await getDefaultUserOrThrow();

  return prisma.eventType.create({
    data: {
      userId: user.id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      durationMinutes: payload.durationMinutes,
    },
  });
}

export async function updateEventType(id, payload) {
  const user = await getDefaultUserOrThrow();
  const existing = await prisma.eventType.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new AppError(404, "Event type not found.");
  }

  return prisma.eventType.update({
    where: { id },
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      durationMinutes: payload.durationMinutes,
      isActive: payload.isActive ?? existing.isActive,
    },
  });
}

export async function deleteEventType(id) {
  const user = await getDefaultUserOrThrow();
  const existing = await prisma.eventType.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new AppError(404, "Event type not found.");
  }

  await prisma.eventType.delete({
    where: { id },
  });

  return { success: true };
}
