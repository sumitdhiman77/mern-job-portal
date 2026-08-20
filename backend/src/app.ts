import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/v1", routes);

export default app;
