import type { Request, Response } from "express";
import { registerUser } from "../services/auth.service.js";

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
