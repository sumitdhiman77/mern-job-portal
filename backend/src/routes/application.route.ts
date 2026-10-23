import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import validate from "../validators/validate.js";
import {
  createApplicationController,
  getMyApplicationsController,
  getApplicationsForJobController,
  updateApplicationStatusController,
} from "../controllers/application.controller.js";
import {
  createApplicationSchema,
  getMyApplicationsSchema,
  getApplicationsForJobSchema,
  updateApplicationStatusSchema,
} from "../validators/application.validators.js";

const router = Router();

router.post(
  "/jobs/:jobId/applications",
  authenticate,
  authorize("job seeker"),
  validate(createApplicationSchema),
  createApplicationController,
);

router.get(
  "/applications/me",
  authenticate,
  authorize("job seeker"),
  validate(getMyApplicationsSchema),
  getMyApplicationsController,
);

router.get(
  "/jobs/:jobId/applications",
  authenticate,
  authorize("employer"),
  validate(getApplicationsForJobSchema),
  getApplicationsForJobController,
);

router.patch(
  "/applications/:id/status",
  authenticate,
  authorize("employer"),
  validate(updateApplicationStatusSchema),
  updateApplicationStatusController,
);
export default router;


