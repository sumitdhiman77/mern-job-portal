import User from "../models/user.model.js";
import type { IUser } from "../interfaces/user.interface.js";
import { AppError } from "../utils/AppError.js";

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
