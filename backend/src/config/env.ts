import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "NODE_ENV",
  "MONGODB_URI",
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRY",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is missing`);
  }
}

export const PORT = Number(process.env.PORT!);
export const NODE_ENV = process.env.NODE_ENV!;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
export const ACCESS_TOKEN_EXPIRY: NonNullable<SignOptions["expiresIn"]> =
  process.env.ACCESS_TOKEN_EXPIRY! as NonNullable<SignOptions["expiresIn"]>;

export const REFRESH_TOKEN_EXPIRY: NonNullable<SignOptions["expiresIn"]> =
  process.env.REFRESH_TOKEN_EXPIRY! as NonNullable<SignOptions["expiresIn"]>;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
