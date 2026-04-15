import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "./appError.js";

export async function getDefaultUserOrThrow() {
  const user = await prisma.user.findUnique({
    where: { email: env.defaultUserEmail },
  });

  if (!user) {
    throw new AppError(
      500,
      "Default user not found. Run the Prisma migration and seed commands before starting the app.",
    );
  }

  return user;
}
