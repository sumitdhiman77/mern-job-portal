import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import type { ApplicationStatus } from "../interfaces/application.interface.js";
import { AppError } from "../utils/AppError.js";

interface createApplicationData {
  coverLetter?: string;
}

export const  createApplication = async (
  applicantId: string,
  jobId: string,
  applicationData: createApplicationData,
) => {
  const job = await Job.findOne({
    _id: jobId,
    isActive: true,
  });

  if (!job) {
    throw new AppError("Job not found or no longer active", 404);
  }

  if (job.lastDate <= new Date()) {
    throw new AppError("Application deadline has passed", 400);
  }

  const existingApplication = await Application.findOne({
    jobId,
    applicantId,
  });

  if (existingApplication) {
    throw new AppError("You have already applied for this job", 409);
  }
  const applicant = await User.findById(applicantId);

  if (!applicant) {
    throw new AppError("Applicant not found", 404);
  }

  if (!applicant.profile.resume.url) {
    throw new AppError("Please upload a resume before applying", 400);
  }

  const application = await Application.create({
    applicantId,
    jobId,
    resume: {
      url: applicant.profile.resume.url,
      originalName: applicant.profile.resume.originalName,
    },
    coverLetter: applicationData.coverLetter ?? "",
    status: "pending",
  });

  return application;
};

export const getMyApplications = async (
  applicantId: string,
  page: number,
  limit: number,
) => {
  const filter = { applicantId };
  const skip = (page - 1) * limit;

  const [applications, totalApplications] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("jobId", "title location salary lastDate"),

    Application.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: {
      currentPage: page,
      limit,
      totalApplications,
      totalPages: Math.ceil(totalApplications / limit),
    },
  };
};

export const getApplicationsForJob = async (
  jobId: string,
  employerId: string,
  page: number,
  limit: number,
) => {
  // 1. Verify job ownership
  const job = await Job.findOne({
    _id: jobId,
    employerId,
  }).select("_id");

  if (!job) {
    throw new AppError("Job not found or you do not own this job", 404);
  }

  // 2. Prepare pagination
  const filter = { jobId: job._id };
  const skip = (page - 1) * limit;

  // 3. Fetch applications and total count concurrently

  const [applications, totalApplications] = await Promise.all([
    Application.find(filter)
      .select("-__v")
      .populate(
        "applicantId",
        "name email profile.profilePicture profile.location",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Application.countDocuments(filter),
  ]);

  // 4. Return data and pagination metadata
  return {
    jobId: job._id,
    applications,
    pagination: {
      currentPage: page,
      limit,
      totalApplications,
      totalPages: Math.ceil(totalApplications / limit),
    },
  };
};

const ALLOWED_STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  pending: ["reviewed", "rejected"],
  reviewed: ["shortlisted", "rejected"],
  shortlisted: ["selected", "rejected"],
  rejected: [],
  selected: [],
};

export const updateApplicationStatus = async (
  applicationId: string,
  employerId: string,
  newStatus: ApplicationStatus,
) => {
  // Find the Application
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new AppError("Application not found", 404);
  }
  // Verify ownership through the associated job
  const job = await Job.findOne({
    _id: application.jobId,
    employerId,
  }).select("_id");

  if (!job) {
    throw new AppError("Application not found or you do not own this job", 404);
  }

  // Prevent invalid or repeated transitions
  const allowedStatuses = ALLOWED_STATUS_TRANSITIONS[application.status];
  if (!allowedStatuses.includes(newStatus)) {
    throw new AppError(
      `Cannot change application status from ${application.status} to ${newStatus}`,
      400,
    );
  }

  application.status = newStatus;
  await application.save();

  return application;
};
