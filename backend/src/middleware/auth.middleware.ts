import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

interface AccessTokenPayload {
  _id: string;
  role: string;
}

export const  authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("authentication required", 401);
  }

  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) {
    throw new AppError("Authentication required", 401);
  }
  try {
    const payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);

    if (typeof payload === "string") {
      throw new AppError("Invalid or expired access token", 401);
    }

    if (typeof payload._id !== "string" || typeof payload.role !== "string") {
      throw new AppError("Invalid or expired access token", 401);
    }

    req.user = {
      _id: payload._id,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid or expired access token", 401);
  }
};
