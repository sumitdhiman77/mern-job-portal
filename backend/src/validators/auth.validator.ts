import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(50).transform((val) =>
        val
          .split(" ")
          .filter(Boolean) // handles accidental double spaces
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
      ),
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
