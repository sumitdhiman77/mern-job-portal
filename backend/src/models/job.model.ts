import { Schema, model } from "mongoose";
import type { IJob } from "../interfaces/job.interface.js";

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },

    salary: {
      min: {
        type: Number,
        required: [true, "Minimum salary is required"],
        min: 0,
      },

      max: {
        type: Number,
        required: [true, "Maximum salary is required"],
        min: 0,
      },
    },

    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
      maxlength: 100,
    },

    requiredSkills: {
      type: [String],
      required: true,
      validate: {
        validator: (skills: string[]) => skills.length >= 1,
        message: "At least one required skill is needed",
      },
    },

    lastDate: {
      type: Date,
      required: [true, "Application deadline is required"],
    },

    employerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employer is required"],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Job = model<IJob>("Job", jobSchema);

export default Job;