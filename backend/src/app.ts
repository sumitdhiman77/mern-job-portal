import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(express.json({limit:"1mb"}));

app.use(express.urlencoded({ extended: true,
  limit:"1mb"
 }));

app.use(cookieParser());

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
