import prismaPkg from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/appError.js";

const { Prisma } = prismaPkg;

export function errorHandler(error, _request, response, _next) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null,
    });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Validation failed.",
      details: error.issues,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return response.status(409).json({
      message: "A unique field value already exists.",
    });
  }

  console.error(error);

  return response.status(500).json({
    message: "Internal server error.",
  });
}
