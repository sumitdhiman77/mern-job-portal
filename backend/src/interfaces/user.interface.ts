import type { Model } from "mongoose";

export interface IResume {
  url: string;
  originalName: string;
}
export const  USER_ROLES = ["job seeker", "employer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUserProfile {
  profilePicture: string;
  resume: IResume;
  companyName: string;
  bio: string;
  education: string;
  skills: string[];
  location: string;
}
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profile: IUserProfile;
  refreshToken?: string;
}
export interface IUserMethods {
  comparePassword(passwordfromLogin: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}
export interface IUserModel extends Model<IUser, {}, IUserMethods> {}
