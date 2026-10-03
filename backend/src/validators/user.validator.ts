import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(50).optional(),

    profile: z.object({
      profilePicture: z.string().trim().optional(),

      companyName: z.string().trim().optional(),

      bio: z.string().trim().max(500).optional(),

      education: z.string().trim().optional(),

      skills: z.array(z.string().trim()).optional(),

      location: z.string().trim().optional(),
    }).optional(),
  })
  .strict()
});
