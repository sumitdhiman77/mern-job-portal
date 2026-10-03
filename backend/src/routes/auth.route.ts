import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller.js";
import validate from "../validators/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
router.get(
  "/employer-test",
  authenticate,
  authorize("employer"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Employer access granted",
      user: req.user,
    });
  },
);

export default router;
