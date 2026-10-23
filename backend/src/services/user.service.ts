import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("user not found", 404);
  }

  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
  };
};

export const updateCurrentUser = async (
  userId: string,
  updateData: {
    name?: string;
    profile?: {
      profilePicture?: string;
      companyName?: string;
      bio?: string;
      education?: string;
      skills?: string[];
      location?: string;
    };
  },
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
  };
};

export const uploadResume = async (
  userId: string,
  file: Express.Multer.File,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError("Only PDF, DOC, and DOCX files are allowed", 400);
  }

  if (!file.buffer || file.size === 0) {
    throw new AppError("Resume file is empty or invalid", 400);
  }

  const isPdf = file.mimetype === "application/pdf";

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "job-portal/resumes",
        resource_type: isPdf ? "image" : "raw",
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary resume upload failed:", error);
          reject(
            new AppError("Failed to upload resume to Cloudinary", 502),
          );
          return;
        }

        if (!result) {
          reject(new AppError("Cloudinary returned no upload result", 502));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    uploadStream.end(file.buffer);
  });

  const previousResume = user.profile.resume;

  user.profile.resume = {
    url: result.secure_url,
    originalName: file.originalname,
  };

  try {
    await user.save();
  } catch (error) {
    // Avoid leaving an orphaned asset if MongoDB saving fails.
    try {
      await cloudinary.uploader.destroy(result.public_id, {
        resource_type: isPdf ? "image" : "raw",
      });
    } catch (cleanupError) {
      console.error("Cloudinary cleanup failed:", cleanupError);
    }

    throw error;
  }

  // Delete the previous Cloudinary asset only after the new resume is saved.
  if (previousResume?.url) {
    try {
      const previousUrl = new URL(previousResume.url);
      const match = previousUrl.pathname.match(
        /\/(?:image|raw)\/upload\/(?:v\d+\/)?(.+)$/,
      );

      if (match?.[1]) {
        const previousPublicId = decodeURIComponent(match[1]).replace(
          /\.[^/.]+$/,
          "",
        );

        const resourceType = previousUrl.pathname.includes("/raw/upload/")
          ? "raw"
          : "image";

        await cloudinary.uploader.destroy(previousPublicId, {
          resource_type: resourceType,
        });
      }
    } catch (cleanupError) {
      console.error("Previous resume cleanup failed:", cleanupError);
    }
  }

  return user.profile.resume;
};