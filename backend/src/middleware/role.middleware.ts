import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { USER_ROLES } from "../interfaces/user.interface.js";

type UserRole = (typeof USER_ROLES)[number];

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new AppError("You are not authorized to access this resource", 403);
    }
    next();
  };
};
