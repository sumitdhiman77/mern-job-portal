import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../utils/AppError.js";

const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Delegate if the response has already started.
  if (res.headersSent) {
    next(error);
    return;
  }

  // 1. Known application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // 2. Multer upload errors
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File size must not exceed 5 MB"
        : "Invalid file upload";

    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  // 3. MongoDB duplicate-key errors
  const dbError = error as Error & { code?: number };

  if (dbError.code === 11000) {
    res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
    return;
  }

  // 4. Malformed JSON request bodies
  const parseError = error as SyntaxError & {
    status?: number;
    body?: unknown;
  };

  if (
    error instanceof SyntaxError &&
    parseError.status === 400 &&
    "body" in parseError
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
    return;
  }

  // 5. Unexpected errors
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorHandler;
