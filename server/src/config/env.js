import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  defaultUserEmail: process.env.DEFAULT_USER_EMAIL ?? "anch51004@gmail.com",
  databaseUrl: process.env.DATABASE_URL ?? "",
};
