// routes/githubDataRoutes.js
const express = require("express");
const router = express.Router();
const { getGithubProfile, getGithubRepos , trackCommitHistory,getHeatmapAndStreaks,getWeeklyPRStats,fetchAndSaveGithubStats} = require("../controllers/githubDataController");
const requireAuth = require("../middlewares/authMiddleware");
const User = require("../models/User");
router.get("/github/profile", requireAuth, getGithubProfile);
router.get("/github/repos", requireAuth, getGithubRepos);
router.get("/github/commitHistory",requireAuth,trackCommitHistory)
router.get("/github/heatmap",requireAuth,getHeatmapAndStreaks)
router.get("/pr-stats-week", requireAuth, getWeeklyPRStats);
router.post("/github/saveStats", requireAuth, async (req, res) => {
  try {
    const fullUser = await User.findById(req.user._id);

    if (!fullUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await fetchAndSaveGithubStats(fullUser);

    res.status(200).json({ message: "Sync complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sync failed" });
  }
});

module.exports = router;
