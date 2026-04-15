import { prisma } from "../lib/prisma.js";
import { getDefaultUserOrThrow } from "../utils/defaultUser.js";

export async function getAvailability() {
  const user = await getDefaultUserOrThrow();
  const rules = await prisma.availabilityRule.findMany({
    where: { userId: user.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return {
    timezone: user.timezone,
    rules,
  };
}

export async function updateAvailability(payload) {
  const user = await getDefaultUserOrThrow();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { timezone: payload.timezone },
    });

    await tx.availabilityRule.deleteMany({
      where: { userId: user.id },
    });

    if (payload.rules.length > 0) {
      await tx.availabilityRule.createMany({
        data: payload.rules.map((rule) => ({
          userId: user.id,
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
        })),
      });
    }
  });

  return getAvailability();
}
