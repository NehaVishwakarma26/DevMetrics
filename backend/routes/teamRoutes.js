import express from "express";
import { createTeam, getUserTeams} from "../controllers/teamController.js";
const requireAuth = require("../middlewares/authMiddleware");

const router=express.Router();

router.post("/create",requireAuth,createTeam);
router.get("/my",requireAuth,getUserTeams)
export default router;