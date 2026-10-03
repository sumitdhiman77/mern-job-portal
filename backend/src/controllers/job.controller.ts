import type { Request, Response } from "express";
import { createJob, getJobs, getJobById,updateJob } from "../services/job.service.js";
import { AppError } from "../utils/AppError.js";
import { getJobsQuerySchema } from "../validators/job.validator.js";

export const createJobController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const job = await createJob(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: "Job created successfully",
    job,
  });
};

export const getJobsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = getJobsQuerySchema.parse(req.query);
  const result = await getJobs(query);

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getJobByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const job = await getJobById(req.params.id as string);

  res.status(200).json({
    success: true,
    job,
  });
};

export const updateJobController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const job = await updateJob(
    req.params.id as string,
    req.user._id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Job updated successfully",
    job,
  });
};