import type{ Types } from "mongoose";

export const APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "shortlisted",
  "rejected",
  "selected",
] as const;

export type ApplicationStatus = 
(typeof APPLICATION_STATUSES)[number];

export interface IApplication {
  jobId:Types.ObjectId;
  applicantId:Types.ObjectId;

  resume:{
    url:string;
    originalName:string;
  };

  coverLetter:string;
  status:ApplicationStatus;

  createdAt:Date;
  updatedAt:Date;

}

