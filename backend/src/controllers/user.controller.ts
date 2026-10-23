import { uploadResume } from "../services/user.service.js";
import { getCurrentUser, updateCurrentUser } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";
import type { Request, Response } from "express";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await getCurrentUser(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await updateCurrentUser(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
};

export const uploadResumeController = async (
  req:Request,
  res:Response
):Promise<void> => {
  if(!req.user){
     throw new AppError("Authentication required", 401);
  }
  if (!req.file) {
    throw new AppError("Resume file is required", 400);
  }

  const resume = await uploadResume(
    req.user._id,
    req.file
  )

  res.status(200).json({
    success: true,
    message: "Resume uploaded successfully",
    resume
  })
};
