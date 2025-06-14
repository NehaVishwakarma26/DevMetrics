const Goal = require("../models/Goal");
const GitHubStat = require("../models/GitHubStat");
const CommitHistory = require("../models/CommitHistory");

const getSmartSuggestions = async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: "No goal set for this user" });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    // --------- 1. Get today's commit count from CommitHistory ---------
    const allCommits = await CommitHistory.find({ user: req.user._id });
    let todayCommits = 0;
    allCommits.forEach((entry) => {
      const dateStr = entry.date.toISOString().split("T")[0];
      if (dateStr === todayStr) {
        todayCommits = entry.commitCount;
      }
    });

    // --------- 2. Get total PRs from GitHubStat for last 7 days ---------
    const allStats = await GitHubStat.find({ user: req.user._id });
    let totalPRs = 0;
    allStats.forEach((entry) => {
      const dateStr = entry.date.toISOString().split("T")[0];
      if (dateStr >= sevenDaysAgoStr && dateStr <= todayStr) {
        totalPRs += entry.pullRequests;
      }
    });

    // --------- 3. Create suggestions ---------
    const suggestions = [];

    if (todayCommits < goal.dailyCommitGoal) {
      const remaining = goal.dailyCommitGoal - todayCommits;
      suggestions.push(
        `You've made ${todayCommits} commits today. Try pushing ${remaining} more to meet your daily goal of ${goal.dailyCommitGoal}.`
      );
    }

    if (todayCommits === 0) {
      suggestions.push(
        `You haven't made any commits today. Your daily goal is ${goal.dailyCommitGoal}. Time to get started! 🚀`
      );
    }

    const remainingPRs = goal.weeklyPRGoal - totalPRs;
    if (remainingPRs > 0) {
      suggestions.push(
        `You've made ${totalPRs} pull requests this week. You have ${remainingPRs} left to meet your weekly goal of ${goal.weeklyPRGoal}.`
      );
    }

    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error("Smart Suggestions Error:", err.message);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = { getSmartSuggestions };
