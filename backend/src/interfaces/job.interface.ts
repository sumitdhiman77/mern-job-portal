import type { Types } from "mongoose";

export interface IJob {
  title: string;
  description: string;

  salary: {
    min: number;
    max: number;
  };

  location: string;
  requiredSkills: string[];
  lastDate: Date;

  employerId: Types.ObjectId;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}