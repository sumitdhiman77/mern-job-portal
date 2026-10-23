import { Types } from "mongoose";
import { z } from "zod";
import { APPLICATION_STATUSES } from "../interfaces/application.interface.js";

const objectIdSchema = z.string().refine((id) => Types.ObjectId.isValid(id), {
  message: "Invalid ID",
});

export const createApplicationSchema = z.object({
  params: z.object({
    jobId: objectIdSchema,
  }),

  body: z
    .object({
      coverLetter: z.string().trim().max(2000).optional(),
    })
    .strict(),
});

export const getMyApplicationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
});

export const getJobApplicationsSchema = z.object({
  params: z.object({
    jobId: objectIdSchema,
  }),
});

export const getApplicationByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const getApplicationsForJobSchema = z.object({
  params: z.object({
    jobId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid job ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
  body: z.object({}).optional(),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid application ID"),
  }),
  body: z.object({
    status: z.enum(APPLICATION_STATUSES),
  }),
  query: z.object({}),
});
