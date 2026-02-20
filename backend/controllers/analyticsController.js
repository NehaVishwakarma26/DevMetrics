const axios = require("axios");
const User = require("../models/User");
const Goal = require("../models/Goal");
const GitHubStat = require("../models/GitHubStat");
const CommitHistory = require("../models/CommitHistory");


// ==========================
// GET USER ANALYTICS
// ==========================
const getUserAnalytics = async (req, res) => {
  try {
    // 🔥 Always fetch full user from DB
    const fullUser = await User.findById(req.user._id);

    if (!fullUser || !fullUser.accessToken) {
      return res.status(400).json({ message: "GitHub token missing" });
    }

    const response = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `token ${fullUser.accessToken}`,
        },
      }
    );

    const {
      public_repos,
      followers,
      following,
      created_at,
      avatar_url,
      bio,
      location,
      html_url,
    } = response.data;

    res.status(200).json({
      username: fullUser.username,
      public_repos,
      followers,
      following,
      created_at,
      avatar_url,
      bio,
      location,
      profile: html_url,
    });

  } catch (err) {
    console.error("Analytics error:", err.response?.data || err.message);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};


// ==========================
// PRODUCTIVITY SCORE
// ==========================
const getProductivityScore = async (req, res) => {
  try {
    console.log("getProductivityScore triggered");

    const goal = await Goal.findOne({ user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: "No goal found" });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const allCommits = await CommitHistory.find({
      user: req.user._id,
    });

    let todayCommit = 0;

    allCommits.forEach((entry) => {
      const dateStr = entry.date.toISOString().split("T")[0];
      if (dateStr === todayStr) {
        todayCommit += entry.commitCount;
      }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 🔥 FIXED DATE FILTER (no string comparison)
    const weeklyStats = await GitHubStat.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo },
    });

    const totalPRs = weeklyStats.reduce(
      (acc, stat) => acc + (stat.pullRequests || 0),
      0
    );

    const dailyProgress =
      goal.dailyCommitGoal > 0
        ? Math.min((todayCommit / goal.dailyCommitGoal) * 100, 100)
        : 0;

    const weeklyProgress =
      goal.weeklyPRGoal > 0
        ? Math.min((totalPRs / goal.weeklyPRGoal) * 100, 100)
        : 0;

    const score =
      (dailyProgress >= 100 ? 60 : 0) +
      (weeklyProgress >= 100 ? 30 : 0);

    return res.status(200).json({
      score,
      breakdown: {
        daily: Math.round(dailyProgress),
        weekly: Math.round(weeklyProgress),
      },
    });

  } catch (err) {
    console.error("Productivity error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserAnalytics,
  getProductivityScore,
};