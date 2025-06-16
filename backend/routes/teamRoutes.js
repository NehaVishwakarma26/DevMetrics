import express from "express";
import { createTeam, getUserTeams} from "../controllers/teamController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router=express.Router();

router.post("/create",authMiddleware,createTeam);
router.get("/my",authMiddleware,getUserTeams)
export default router;