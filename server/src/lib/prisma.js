import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import prismaPkg from "@prisma/client";
import WebSocket from "ws";
import { env } from "../config/env.js";

const { PrismaClient } = prismaPkg;

const globalForPrisma = globalThis;

neonConfig.webSocketConstructor = WebSocket;

const adapter = new PrismaNeon({
  connectionString: env.databaseUrl,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
