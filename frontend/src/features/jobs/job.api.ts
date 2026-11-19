import { apiRequest } from "../../lib/api";

export type Job = {
  _id: string;
  title: string;
  description: string;
  salary: {
    min: number;
    max: number;
  };
  location: string;
  requiredSkills: string[];
  lastDate: string;
  employerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MyJobsPagination = {
  currentPage: number;
  limit: number;
  totalJobs: number;
  totalPages: number;
};

export type MyJobsResponse = {
  success: boolean;
  jobs: Job[];
  pagination: MyJobsPagination;
};

export function getMyJobs(
  accessToken: string,
  page = 1,
  limit = 10,
): Promise<MyJobsResponse> {
  return apiRequest<MyJobsResponse>(
    `/jobs/my?page=${page}&limit=${limit}`,
    { method: "GET" },
    accessToken,
  );
}

export type CreateJobInput = {
  title: string;
  description: string;
  salary: {
    min: number;
    max: number;
  };
  location: string;
  requiredSkills: string[];
  lastDate: string;
};

export type CreateJobResponse = {
  success: boolean;
  message: string;
  job: Job;
};

export function createJob(
  input: CreateJobInput,
  accessToken: string,
): Promise<CreateJobResponse> {
  return apiRequest<CreateJobResponse>(
    "/jobs",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    accessToken,
  );
}
