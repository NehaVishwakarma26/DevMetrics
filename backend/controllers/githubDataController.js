const axios = require("axios");
const User = require("../models/User");
const GithubStat = require("../models/GitHubStat");


// =============================
// GET GITHUB PROFILE
// =============================
const getGithubProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user?.accessToken) {
      return res.status(400).json({ message: "GitHub token missing" });
    }

    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${user.accessToken}`,
      },
    });

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =============================
// GET USER REPOS
// =============================
const getGithubRepos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user?.accessToken) {
      return res.status(400).json({ message: "GitHub token missing" });
    }

    const response = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers: {
          Authorization: `token ${user.accessToken}`,
        },
        params: { per_page: 100 },
      }
    );

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =============================
// 🔥 FIXED INCREMENTAL SYNC
// =============================
const fetchAndSaveGithubStats = async (user) => {
  try {
    if (!user?.accessToken) {
      console.log("No access token found.");
      return;
    }

    const headers = {
      Authorization: `token ${user.accessToken}`,
    };

    // 🔥 Always get real GitHub login
    const profileRes = await axios.get(
      "https://api.github.com/user",
      { headers }
    );

    const githubLogin = profileRes.data.login;

    // 🔥 Determine incremental start
    const lastSync =
      user.lastGithubSync ||
      new Date(Date.now() - 24 * 60 * 60 * 1000);

    const now = new Date();

    console.log("Syncing from:", lastSync);

    // 🔥 Get repos
    const repoRes = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers,
        params: { per_page: 100 },
      }
    );

    const repos = repoRes.data;

    const commitCountsByDate = {};
    const prCountsByDate = {};
    const issueCountsByDate = {};

    for (const repo of repos) {
      const owner = repo.owner.login;
      const repoName = repo.name;

      // =============================
      // COMMITS (Let GitHub filter)
      // =============================
      try {
        const commitRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repoName}/commits`,
          {
            headers,
            params: {
              author: githubLogin,
              since: lastSync.toISOString(),
              per_page: 100,
            },
          }
        );

        for (const commit of commitRes.data) {
          const date = commit.commit.author.date.split("T")[0];
          commitCountsByDate[date] =
            (commitCountsByDate[date] || 0) + 1;
        }
      } catch (err) {
  console.log(`Commit fetch failed for ${repoName}`);
  console.log("Status:", err.response?.status);
  console.log("Message:", err.response?.data);
}

      // =============================
      // PRs
      // =============================
      try {
        const prRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repoName}/pulls`,
          {
            headers,
            params: { state: "all", per_page: 100 },
          }
        );

        for (const pr of prRes.data) {
          if (
            pr.user.login === githubLogin &&
            new Date(pr.created_at) > lastSync
          ) {
            const date = pr.created_at.split("T")[0];
            prCountsByDate[date] =
              (prCountsByDate[date] || 0) + 1;
          }
        }
      } catch (err) {
        console.log(`PR fetch failed for ${repoName}`);
      }

      // =============================
      // ISSUES
      // =============================
      try {
        const issueRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repoName}/issues`,
          {
            headers,
            params: { state: "all", per_page: 100 },
          }
        );

        for (const issue of issueRes.data) {
          if (
            !issue.pull_request &&
            issue.user.login === githubLogin &&
            new Date(issue.created_at) > lastSync
          ) {
            const date = issue.created_at.split("T")[0];
            issueCountsByDate[date] =
              (issueCountsByDate[date] || 0) + 1;
          }
        }
      } catch (err) {
        console.log(`Issue fetch failed for ${repoName}`);
      }
    }

    // =============================
    // SAVE TO DB
    // =============================
    const allDates = new Set([
      ...Object.keys(commitCountsByDate),
      ...Object.keys(prCountsByDate),
      ...Object.keys(issueCountsByDate),
    ]);

    for (const dateStr of allDates) {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);

      await GithubStat.findOneAndUpdate(
        { user: user._id, date },
        {
          $inc: {
            commits: commitCountsByDate[dateStr] || 0,
            pullRequests: prCountsByDate[dateStr] || 0,
            issues: issueCountsByDate[dateStr] || 0,
          },
        },
        { upsert: true }
      );
    }

    // 🔥 Update last sync
    await User.findByIdAndUpdate(user._id, {
      lastGithubSync: now,
    });

    console.log("Sync complete.");
  } catch (error) {
    console.log("Sync failed:", error.message);
  }
};


// =============================
// HEATMAP
// =============================
const getHeatmapAndStreaks = async (req, res) => {
  try {
    const stats = await GithubStat.find({
      user: req.user._id,
    });

    const heatmapData = stats.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      count: entry.commits || 0,
    }));

    res.status(200).json({ heatmapData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =============================
const trackCommitHistory = async (req, res) => {
  try {
    const fullUser = await User.findById(req.user._id);
    await fetchAndSaveGithubStats(fullUser);

    res.status(200).json({ message: "Synced successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getWeeklyPRStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await GithubStat.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    const prStats = stats.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      pullRequests: entry.pullRequests || 0,
    }));

    res.status(200).json(prStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getGithubProfile,
  getGithubRepos,
  fetchAndSaveGithubStats,
  getHeatmapAndStreaks,
  trackCommitHistory,
  getWeeklyPRStats,
};