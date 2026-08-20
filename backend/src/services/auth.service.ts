import User from "../models/user.model.js";
import type { IUser } from "../interfaces/user.interface.js";

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
