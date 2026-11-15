import { apiRequest } from "../../lib/api";

export type Resume = {
  url: string;
  originalName: string;
};

export type UserProfile = {
  resume?: Resume | null;
};

export type CurrentUser = {
  _id: string;
  name: string;
  email: string;
  role: "job seeker" | "employer";
  profile?: UserProfile;
};

type CurrentUserResponse = {
  success: boolean;
  user: CurrentUser;
};

export type UploadResumeResponse = {
  success: boolean;
  message: string;
  resume: Resume;
};

export function getMyProfile(
  accessToken: string,
): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>(
    "/users/me",
    { method: "GET" },
    accessToken,
  );
}

export function uploadResume(
  file: File,
  accessToken: string,
): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append("resume", file);

  return apiRequest<UploadResumeResponse>(
    "/users/me/resume",
    {
      method: "POST",
      body: formData,
    },
    accessToken,
  );
}