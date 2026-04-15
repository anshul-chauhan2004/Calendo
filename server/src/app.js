import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
  }),
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
  });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
