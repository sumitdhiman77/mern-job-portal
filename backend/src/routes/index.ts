import { Router } from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import jobRoutes from "./job.route.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/jobs",jobRoutes)

export default router;
