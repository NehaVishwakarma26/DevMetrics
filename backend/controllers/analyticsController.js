const axios = require("axios");
const Goal=require("../models/Goal")
const GitHubStat=require("../models/GitHubStat")
const CommitHistory=require("../models/CommitHistory")

const getUserAnalytics = async (req, res) => {
  try {
    const user = req.user; // from JWT, contains id + username

    const response = await axios.get(
      `https://api.github.com/users/${user.username}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_PERSONAL_TOKEN}`,
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
      username: user.username,
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
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: err.message });
  }
};

const getProductivityScore = async (req, res) => {
  try {
    console.log("getProductivityScore triggered");

    const goal = await Goal.findOne({ user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: "No goal found" });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const allCommits = await CommitHistory.find({ user: req.user._id });

    let todayCommit = 0;
    allCommits.forEach((entry) => {
      const dateStr = entry.date.toISOString().split("T")[0];
      if (dateStr === todayStr) {
        todayCommit += entry.commitCount;
      }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyStats = await GitHubStat.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo.toISOString().split("T")[0] },
    });

    const totalPRs = weeklyStats.reduce((acc, stat) => acc + (stat.pullRequests || 0), 0);

    const dailyProgress = Math.min((todayCommit / goal.dailyCommitGoal) * 100, 100);
    const weeklyProgress = Math.min((totalPRs / goal.weeklyPRGoal) * 100, 100);

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
    console.error("❌ Error in getProductivityScore:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports = { getUserAnalytics,getProductivityScore };