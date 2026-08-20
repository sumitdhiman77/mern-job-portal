import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Schema, model } from "mongoose";
import {
  type IUser,
  type IUserMethods,
  type IUserModel,
  type IUserProfile,
  type IResume,
  USER_ROLES,
} from "../interfaces/user.interface.js";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
} from "../config/env.js";

// ==========================================
// 1. THE SCHEMA (The Blueprint)
// ==========================================

const resumeSchema = new Schema<IResume>(
  {
    url: {
      type: String,
      default: "",
    },
    originalName: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const profileSchema = new Schema<IUserProfile>(
  {
    profilePicture: {
      type: String,
      default: "",
    },
    resume: {
      type: resumeSchema,
      default: {},
    },
    companyName: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    education: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      maxlength: 128,
      select: false,
    },
    profile: {
      type: profileSchema,
      default: {},
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "job seeker",
    },
    refreshToken: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);
// A pre-hook or pre middleware that runs before the 'save' event
// Method to safely verify a password -->

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});
// ==========================================
// 2. INSTANCE METHODS (Document Level)
// ==========================================
userSchema.methods.comparePassword = function (loginPassword: string) {
  return bcrypt.compare(loginPassword, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id, role: this.role }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};
const User = model<IUser, IUserModel>("User", userSchema);
export default User;
