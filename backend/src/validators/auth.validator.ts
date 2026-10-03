import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(50),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(128),
    role: z.enum(["job seeker", "employer"]).optional(),
  }),
});
export const loginSchema = z.object({
  body: z.object  ({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(128),
  }),
  params: z.object({}),
  query: z.object({}),
});
