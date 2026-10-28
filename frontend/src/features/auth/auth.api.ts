import { apiRequest } from "../../lib/api";

export type UserRole = "job seeker" | "employer";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUser;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export function registerUser(input: RegisterInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}