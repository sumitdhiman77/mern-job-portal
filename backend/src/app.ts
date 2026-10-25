
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes/index.js";
import errorHandler from "./middleware/error.middleware.js";
import { CORS_ORIGINS } from "./config/env.js";
import { AppError } from "./utils/AppError.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without Origin include Postman and server-to-server clients.
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (CORS_ORIGINS.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new AppError("Origin not allowed by CORS", 403));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
