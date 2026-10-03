import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import type { IUser } from "../interfaces/user.interface.js";
import { AppError } from "../utils/AppError.js";
import { REFRESH_TOKEN_SECRET } from "../config/env.js";

export const registerUser = async (userData: IUser) => {
  const existingUser = await User.findOne({
    email: userData.email,
  });
  if (existingUser) {
    throw new Error("Email already registered");
  }
  const user = new User(userData);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save();

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("invalid email or password", 401);
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new AppError("invalid email or password", 401);
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  let decoded: jwt.JwtPayload;

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    if (typeof payload === "string") {
      throw new Error();
    }
    decoded = payload;
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }
  if (!decoded._id || typeof decoded._id !== "string") {
    throw new AppError("Invalid or expired refresh token", 401);
  }
  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();
  user.refreshToken = newRefreshToken;

  await user.save();
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

