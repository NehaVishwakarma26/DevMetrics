const axios = require("axios");
const User = require("../models/User");
const CommitHistory = require("../models/CommitHistory");

const GithubStat=require("../models/GitHubStat")

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
    console.log(req.user)
    const user = await User.findById(req.user._id);

if(!user || !user.accessToken)
{
  return res.status(400).json({message:"Github access token not found"})

}

    const response = await axios.get(`https://api.github.com/user/repos`,{
      headers:{
        Authorization:`Bearer ${user.accessToken}`,
        Accept:"application/vnd.github+json"
      }
    });
    // console.log(response)
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch GitHub repos", error: err.message });
  }
};

const trackCommitHistory = async (req, res) => {
  try {
    const user = req.user;
    const githubUsername = user.username;

    // console.log("➡️  trackCommitHistory triggered for", githubUsername);

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

    // console.log("📅 Commit Counts:", commitCounts);

    if (Object.keys(commitCounts).length === 0) {
      return res.status(200).json({ message: "No commits found in the date range." });
    }

    for (const [date, count] of Object.entries(commitCounts)) {
      // console.log("💾 Saving to DB:", { date, count });

      await CommitHistory.findOneAndUpdate(
        { user: user._id, date: new Date(date) },
        { $set: { commitCount: count } },
        { upsert: true }
      );
    }

    res.status(200).json({ message: "Commit history updated", commitCounts });
  } catch (err) {
    console.error(" Error in trackCommitHistory:", err.message);
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

    // console.log(" History from DB:", history);

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
    console.error("Error generating streaks:", err.message);
    res.status(500).json({ message: "Error fetching heatmap data", error: err.message });
  }
};


const getWeeklyPRStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await GithubStat.find({
      user: userId,
      date: { $gte: sevenDaysAgo.toISOString().split("T")[0] },
    }).sort({ date: 1 });

    const prStats = stats.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      pullRequests: entry.pullRequests || 0,
    }));

    res.status(200).json(prStats);
  } catch (err) {
    console.error(" Error fetching weekly PR stats:", err.message);
    res.status(500).json({ message: "Error fetching PR stats", error: err.message });
  }
};

const fetchAndSaveGithubStats = async (user, targetDate = new Date()) => {
  const { username, accessToken, _id: userId } = user;

  const headers = {
    Authorization: `token ${accessToken}`,
    Accept: "application/vnd.github+json",
  };

  // Step 1: Get user's GitHub login
  const userInfoRes = await axios.get("https://api.github.com/user", { headers });
  const loginUsername = userInfoRes.data.login;

  // Step 2: Get user's repos
  const repoRes = await axios.get(
    `https://api.github.com/users/${username}/repos?per_page=50`,
    { headers }
  );
  const repos = repoRes.data;

  // Step 3: Normalize date
  const date = new Date(targetDate);
  date.setHours(0, 0, 0, 0);
  const dateStr = date.toISOString().split("T")[0];

  // Step 4: Skip if already synced
  const alreadySynced = await GithubStat.findOne({ user: userId, date });
  if (alreadySynced) return;

  let dailyCommits = 0;
  const perRepoCommits = {};
  const perRepoPRs = {}; //
  const since = new Date(date);
  const until = new Date(date);
  until.setDate(since.getDate() + 1);

  // Step 5: Count commits per repo
  for (const repo of repos) {
    const repoOwner = repo.owner?.login || username;
    const url = `https://api.github.com/repos/${repoOwner}/${repo.name}/commits`;

    try {
      const res = await axios.get(url, {
        headers,
        params: {
          author: loginUsername,
          since: since.toISOString(),
          until: until.toISOString(),
        },
      });

      let validCommitsInThisRepo = 0;
      for (const commit of res.data) {
        const authorLogin = commit.author?.login;
        const commitEmail = commit.commit?.author?.email || "";
        const commitName = commit.commit?.author?.name || "";

        if (
          (authorLogin && authorLogin.toLowerCase() === loginUsername.toLowerCase()) ||
          commitEmail.toLowerCase().includes(username.toLowerCase()) ||
          commitName.toLowerCase().includes(username.toLowerCase())
        ) {
          dailyCommits++;
          validCommitsInThisRepo++;
        }
      }

      perRepoCommits[repo.name] = validCommitsInThisRepo;
    } catch (err) {
      console.log(`Error fetching commits for ${repo.name}: ${err.message}`);
    }

    //  Step 6: Count PRs for this repo
    try {
      const prRes = await axios.get(
        `https://api.github.com/search/issues?q=repo:${repoOwner}/${repo.name}+type:pr+author:${loginUsername}+created:${dateStr}`,
        { headers }
      );
      perRepoPRs[repo.name] = prRes.data.total_count || 0;
    } catch (err) {
      console.log(` Error fetching PRs for ${repo.name}: ${err.message}`);
    }
  }

  // Step 7: Fetch total PRs and Issues across all repos
  const prsRes = await axios.get(
    `https://api.github.com/search/issues?q=involves:${loginUsername}+type:pr+created:${dateStr}`,
    { headers }
  );

  const issuesRes = await axios.get(
    `https://api.github.com/search/issues?q=author:${loginUsername}+type:issue+created:${dateStr}`,
    { headers }
  );

  // Step 8: Save stats
  await GithubStat.findOneAndUpdate(
    { user: userId, date },
    {
      commits: dailyCommits,
      pullRequests: prsRes.data.total_count,
      issues: issuesRes.data.total_count,
      perRepoCommits,
      perRepoPRs, // saving new field
    },
    { upsert: true, new: true }
  );

  console.log(` Synced ${dailyCommits} commits, ${prsRes.data.total_count} PRs, ${issuesRes.data.total_count} issues for ${dateStr}`);
};



module.exports = {
  getGithubProfile,
  getGithubRepos,
  trackCommitHistory,
  getHeatmapAndStreaks,
  getWeeklyPRStats,
  fetchAndSaveGithubStats
};
