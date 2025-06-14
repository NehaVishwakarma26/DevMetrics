// routes/githubDataRoutes.js
const express = require("express");
const router = express.Router();
const { getGithubProfile, getGithubRepos , trackCommitHistory,getHeatmapAndStreaks,getWeeklyPRStats} = require("../controllers/githubDataController");
const requireAuth = require("../middlewares/authMiddleware");

router.get("/github/profile", requireAuth, getGithubProfile);
router.get("/github/repos", requireAuth, getGithubRepos);
router.get("/github/commitHistory",requireAuth,trackCommitHistory)
router.get("/github/heatmap",requireAuth,getHeatmapAndStreaks)
router.get("/pr-stats-week", requireAuth, getWeeklyPRStats);


module.exports = router;
