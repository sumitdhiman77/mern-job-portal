import type { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/user.model.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    accessToken,
    user,
  });
};
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await loginUser(email, password);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    user,
  });
};
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshAccessToken(refreshToken);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    accessToken,
  });
};
export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await User.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: 1 } },
    );
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
