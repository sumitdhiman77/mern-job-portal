import type { Request, Response } from "express";
import {
  createApplication,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus
} from "../services/application.service.js";
import { AppError } from "../utils/AppError.js";

export const createApplicationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const application = await createApplication(
    req.user._id,
    req.params.jobId as string,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    application,
  });
};

export const getMyApplicationsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication Required", 401);
  }
  const { page = 1, limit = 10 } = req.query;

  const result = await getMyApplications(
    req.user._id,
    Number(page),
    Number(limit),
  );

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getApplicationsForJobController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { page = 1, limit = 10 } = req.query;

  const result = await getApplicationsForJob(
    req.params.jobId as string,
    req.user._id,
    Number(page),
    Number(limit),
  );

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const updateApplicationStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const application = await updateApplicationStatus(
    req.params.id as string,
    req.user._id,
    req.body.status,
  );

  res.status(200).json({
    success: true,
    message: "Application status updated successfully",
    application,
  });
};
