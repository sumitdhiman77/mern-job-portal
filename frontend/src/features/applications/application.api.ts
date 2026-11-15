import { apiRequest } from "../../lib/api";

export type Application = {
  _id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "selected";
  createdAt: string;
};
export type ApplicationJob = {
  _id: string;
  title: string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
  };
  lastDate: string;
};

export type MyApplication = {
  _id: string;
  jobId: ApplicationJob;
  applicantId: string;
  resume: {
    url: string;
    originalName: string;
  };
  coverLetter: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "selected";
  createdAt: string;
};

export type ApplicationsPagination = {
  currentPage: number;
  limit: number;
  totalApplications: number;
  totalPages: number;
};

export type MyApplicationsResponse = {
  success: boolean;
  applications: MyApplication[];
  pagination: ApplicationsPagination;
};

export function getMyApplications(
  accessToken: string,
  page = 1,
  limit = 10,
): Promise<MyApplicationsResponse> {
  return apiRequest<MyApplicationsResponse>(
    `/applications/me?page=${page}&limit=${limit}`,
    { method: "GET" },
    accessToken,
  );
}
export type CreateApplicationResponse = {
  success: boolean;
  message: string;
  application: Application;
};

export type CreateApplicationInput = {
  coverLetter?: string;
};

export function applyForJob(
  jobId: string,
  input: CreateApplicationInput,
  accessToken: string,
): Promise<CreateApplicationResponse> {
  return apiRequest<CreateApplicationResponse>(
    `/jobs/${jobId}/applications`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    accessToken,
  );
}
export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "selected";

export type EmployerApplicant = {
  _id: string;
  name: string;
  email: string;
  profile?: {
    profilePicture?: string;
    location?: string;
  };
};

export type EmployerApplication = {
  _id: string;
  jobId: string;
  applicantId: EmployerApplicant;
  resume: {
    url: string;
    originalName: string;
  };
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type JobApplicationsResponse = {
  success: boolean;
  jobId: string;
  applications: EmployerApplication[];
  pagination: ApplicationsPagination;
};

export type UpdateApplicationStatusResponse = {
  success: boolean;
  message: string;
  application: EmployerApplication;
};

export function getApplicationsForJob(
  jobId: string,
  accessToken: string,
  page = 1,
  limit = 10,
): Promise<JobApplicationsResponse> {
  return apiRequest<JobApplicationsResponse>(
    `/jobs/${jobId}/applications?page=${page}&limit=${limit}`,
    { method: "GET" },
    accessToken,
  );
}

export function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  accessToken: string,
): Promise<UpdateApplicationStatusResponse> {
  return apiRequest<UpdateApplicationStatusResponse>(
    `/applications/${applicationId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    accessToken,
  );
}