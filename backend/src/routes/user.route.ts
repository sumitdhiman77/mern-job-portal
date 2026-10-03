import { Router } from "express";
import { getMe, updateMe } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import validate from "../validators/validate.js";
import { updateProfileSchema } from "../validators/user.validator.js";

const router = Router();

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, validate(updateProfileSchema), updateMe);

export default router;
