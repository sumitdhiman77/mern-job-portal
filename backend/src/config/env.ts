import { z } from "zod";
import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  MONGODB_URI: z.string().trim().min(1),

  ACCESS_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRY: z.string().regex(/^\d+(ms|s|m|h|d|w|y)$/),

  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRY: z.string().regex(/^\d+(ms|s|m|h|d|w|y)$/),

  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1),
  CLOUDINARY_API_KEY: z.string().trim().min(1),
  CLOUDINARY_API_SECRET: z.string().trim().min(1),

  // Comma-separated browser origins allowed to call this API.
  CORS_ORIGINS: z.string().trim().default("http://localhost:3000"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");
  console.error(parsedEnv.error.issues.map((issue) => ({
    variable: issue.path.join("."),
    problem: issue.message,
  })));
  process.exit(1);
}

const env = parsedEnv.data;

export const PORT = env.PORT;
export const NODE_ENV = env.NODE_ENV;
export const MONGODB_URI = env.MONGODB_URI;

export const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRY =
  env.ACCESS_TOKEN_EXPIRY as NonNullable<SignOptions["expiresIn"]>;

export const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRY =
  env.REFRESH_TOKEN_EXPIRY as NonNullable<SignOptions["expiresIn"]>;

export const CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = env.CLOUDINARY_API_SECRET;

export const CORS_ORIGINS = env.CORS_ORIGINS
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);
