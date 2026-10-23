import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { AppError } from "../utils/AppError.js";

interface CreateJobData {
  title: string;
  description: string;
  salary: {
    min: number;
    max: number;
  };
  location: string;
  requiredSkills: string[];
  lastDate: Date;
}

export const createJob = async (employerId: string, jobData: CreateJobData) => {
  const job = await Job.create({
    ...jobData,
    employerId,
  });

  return job;
};

export const getJobs = async ({
  page,
  limit,
  location,
  skill,
}: {
  page: number;
  limit: number;
  location?: string | undefined;
  skill?: string | undefined;
}) => {
  const filter: Record<string, unknown> = {
    isActive: true,
  };

  if (location) {
    filter.location = {
      $regex: location,
      $options: "i",
    };
  }

  if (skill) {
    filter.requiredSkills = {
      $regex: skill,
      $options: "i",
    };
  }

  const skip = (page - 1) * limit;

  const [jobs, totalJobs] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    pagination: {
      currentPage: page,
      limit,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
    },
  };
};
export const getJobById = async (jobId: string) => {
  const job = await Job.findOne({ _id: jobId, isActive: true });
  if (!job) {
    throw new AppError("Job not found", 404);
  }
  return job;
};

interface updateJobData {
  title?: string;
  description?: string;
  salary?: {
    min: number;
    max: number;
  };
  location?: string;
  requiredSkills?: string[];
  lastDate?: Date;
  isActive?: boolean;
}

export const updateJob = async (
  jobId: string,
  employerId: string,
  updateData: updateJobData,
) => {
  const job = await Job.findOne({
    _id: jobId,
    employerId,
  });

  if (!job) {
    throw new AppError("Job not found or you do not own this job", 404);
  }

  Object.assign(job, updateData);

  await job.save();
  return job;
};

export const deleteJob = async (jobId: string, employerId: string) => {
  const job = await Job.findOne({
    _id: jobId,
    employerId,
  });

  if (!job) {
    throw new AppError("Job not found or you do not own this job", 404);
  }

  const applicationCount = await Application.countDocuments({
    jobId,
  });

  if (applicationCount > 0) {
    throw new AppError("Cannot delete a job that has applications", 409);
  }

  await Job.deleteOne();
};
