import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("user not found", 404);
  }

  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
  };
};

export const updateCurrentUser = async (
  userId: string,
  updateData: {
    name?: string;
    profile?: {
      profilePicture?: string;
      companyName?: string;
      bio?: string;
      education?: string;
      skills?: string[];
      location?: string;
    };
  },
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
  };
};
