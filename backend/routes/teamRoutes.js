import express from "express";
import { createTeam, TeamController } from "../controllers/teamController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router=express.Router();

router.post("/create",authMiddleware,createTeam);

export default router;