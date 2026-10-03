import { z } from "zod";
import { Types } from "mongoose";

export const createJobSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(3).max(100),

      description: z.string().trim().min(20).max(5000),

      salary: z
        .object({
          min: z.number().nonnegative(),
          max: z.number().nonnegative(),
        })
        .refine((salary) => salary.min <= salary.max, {
          message: "Minimum salary cannot be greater than maximum salary",
          path: ["min"],
        }),

      location: z.string().trim().min(2).max(100),

      requiredSkills: z
        .array(z.string().trim().min(1))
        .min(1, "At least one required skill is needed"),

      lastDate: z.coerce.date().refine((date) => date > new Date(), {
        message: "Application deadline must be in the future",
      }),
    })
    .strict(),
});

export const getJobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(50).default(10),

  location: z.string().trim().optional(),

  skill: z.string().trim().optional(),
});

export const getJobsSchema = z.object({
  query: getJobsQuerySchema,
});

export const getJobByIdSchema = z.object({
  params: z.object({
    id: z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: "Invalid job ID",
    }),
  }),
});
export const updateJobSchema = z.object({
  params: z.object({
    id: z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: "Invalid job ID",
    }),
  }),

  body: z
    .object({
      title: z.string().trim().min(3).max(100).optional(),

      description: z.string().trim().min(20).max(5000).optional(),

      salary: z
        .object({
          min: z.number().nonnegative(),
          max: z.number().nonnegative(),
        })
        .refine((salary) => salary.min <= salary.max, {
          message: "Minimum salary cannot be greater than maximum salary",
          path: ["min"],
        })
        .optional(),

      location: z.string().trim().min(2).max(100).optional(),

      requiredSkills: z
        .array(z.string().trim().min(1))
        .min(1, "At least one required skill is needed")
        .optional(),

      lastDate: z.coerce
        .date()
        .refine((date) => date > new Date(), {
          message: "Application deadline must be in the future",
        })
        .optional(),

      isActive: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update the job",
    }),
});
