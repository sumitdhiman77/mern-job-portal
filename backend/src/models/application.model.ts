import { Schema, model } from "mongoose";
import type { IApplication } from "../interfaces/application.interface.js";
import { APPLICATION_STATUSES } from "../interfaces/application.interface.js";

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is Required"],
      index: true,
    },

    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is Required"],
      index: true,
    },

    resume: {
      url: {
        type: String,
        required: [true, "Resume URL is Required"],
      },
      originalName: {
        type: String,
        required: [true, "Resume name is Required"],
      },
    },

    coverLetter: {
      type: String,
      trim: true,
      maxLength: 2000,
      default: "",
    },

    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

const Application = model<IApplication>("Application", applicationSchema);

export default Application;
