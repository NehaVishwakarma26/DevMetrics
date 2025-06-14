const axios = require("axios");
const User = require("../models/User");
const CommitHistory = require("../models/CommitHistory");

const getGithubProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const response = await axios.get(`https://api.github.com/user/${user.githubId}`, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    });

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getGithubRepos = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const response = await axios.get(`https://api.github.com/users/${user.username}/repos`);
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch GitHub repos", error: err.message });
  }
};

const trackCommitHistory = async (req, res) => {
  try {
    const user = req.user;
    const githubUsername = user.username;

    console.log("➡️  trackCommitHistory triggered for", githubUsername);

    const reposResponse = await axios.get(`https://api.github.com/users/${githubUsername}/repos`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PERSONAL_TOKEN}`
      }
    });

    const repos = reposResponse.data;
    if (repos.length === 0) {
      console.warn("No repos found for user:", githubUsername);
    }

  const sinceDays = parseInt(req.query.sinceDays) || 365;
const sinceDate = new Date();
sinceDate.setDate(sinceDate.getDate() - sinceDays);

    const commitCounts = {};

    for (const repo of repos) {
      try {
        const commitsResponse = await axios.get(
          `https://api.github.com/repos/${githubUsername}/${repo.name}/commits`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_PERSONAL_TOKEN}`
            },
            params: {
              since: sinceDate.toISOString()
              // 🔁 REMOVED 'author' to avoid mismatch
            }
          }
        );

        const commits = commitsResponse.data;

        commits.forEach((commit) => {
          const commitDate = commit.commit.author.date.split("T")[0];
          commitCounts[commitDate] = (commitCounts[commitDate] || 0) + 1;
        });
      } catch (err) {
        console.error(`❌ Error fetching commits for repo ${repo.name}:`, err.message);
      }
    }

    console.log("📅 Commit Counts:", commitCounts);

    if (Object.keys(commitCounts).length === 0) {
      return res.status(200).json({ message: "No commits found in the date range." });
    }

    for (const [date, count] of Object.entries(commitCounts)) {
      console.log("💾 Saving to DB:", { date, count });

      await CommitHistory.findOneAndUpdate(
        { user: user._id, date: new Date(date) },
        { $set: { commitCount: count } },
        { upsert: true }
      );
    }

    res.status(200).json({ message: "✅ Commit history updated", commitCounts });
  } catch (err) {
    console.error("❌ Error in trackCommitHistory:", err.message);
    res.status(500).json({ message: "Error tracking commit history", error: err.message });
  }
};

const getHeatmapAndStreaks = async (req, res) => {
  try {
    const userId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 365);

    const history = await CommitHistory.find({
      user: userId,
      date: { $gte: startDate, $lte: today }
    });

    console.log("🧾 History from DB:", history);

    const commitMap = new Map();
    for (const entry of history) {
      const dateStr = entry.date.toISOString().split("T")[0];
      commitMap.set(dateStr, entry.commitCount);
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let d = new Date(today); d >= startDate; d.setDate(d.getDate() - 1)) {
      const dateStr = d.toISOString().split("T")[0];

      if (commitMap.has(dateStr)) {
        tempStreak++;
        if (d.getTime() === today.getTime()) currentStreak = tempStreak;
        longestStreak = Math.max(tempStreak, longestStreak);
      } else {
        if (d.getTime() === today.getTime()) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }

    const heatmapData = Array.from(commitMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    res.status(200).json({
      heatmapData,
      currentStreak,
      longestStreak
    });
  } catch (err) {
    console.error("❌ Error generating streaks:", err.message);
    res.status(500).json({ message: "Error fetching heatmap data", error: err.message });
  }
};

module.exports = {
  getGithubProfile,
  getGithubRepos,
  trackCommitHistory,
  getHeatmapAndStreaks
};
