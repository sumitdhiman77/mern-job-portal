import { Router } from "express";
import {
  createJobController,
  getJobsController,
  getJobByIdController,
  updateJobController,
} from "../controllers/job.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import validate from "../validators/validate.js";
import {
  createJobSchema,
  getJobsSchema,
  getJobByIdSchema,
  updateJobSchema,
} from "../validators/job.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("employer"),
  validate(createJobSchema),
  createJobController,
);

router.get("/", authenticate, validate(getJobsSchema), getJobsController);

router.get(
  "/:id",
  validate(getJobByIdSchema),
  getJobByIdController,
);

router.patch(
  "/:id",
  authenticate,
  authorize("employer"),
  validate(updateJobSchema),
  updateJobController,
);

export default router;
