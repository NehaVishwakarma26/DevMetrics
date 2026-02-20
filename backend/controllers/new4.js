/*
 What is the most complicated code you have written independently without AI or anyone else's assistance? Attach the question as multiline comment above your code and upload the file.

 */

const EventEmitter = require("events");
const axios = require("axios");

const User = require("../models/User");
const CommitHistory = require("../models/CommitHistory");
const GithubStat = require("../models/GithubStat");
const DashboardSummary = require("../models/DashboardSummary");
const Notification = require("../models/Notification");

// ------------------- Logger -------------------
function logEvent(event, data = {}) {
  console.log(new Date().toISOString(), event, data);
}

// ------------------- GitHub API with Retry -------------------
async function callGitHubAPI(url, token, retries = 3, backoff = 500) {
  try {
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (err) {
    if (retries > 0) {
      logEvent("API Retry", { url, retriesLeft: retries - 1, error: err.message });
      await new Promise(r => setTimeout(r, backoff));
      return callGitHubAPI(url, token, retries - 1, backoff * 2);
    }
    logEvent("API Fail", { url, error: err.message });
    throw err;
  }
}

// ------------------- Dependency Graph -------------------
class DependencyGraph {
  constructor() {
    this.graph = new Map();
  }

  addTask(task, dependencies = []) {
    this.graph.set(task, dependencies);
  }

  resolveOrder(target, visited = new Set(), order = []) {
    if (visited.has(target)) return;
    visited.add(target);

    const deps = this.graph.get(target) || [];
    deps.forEach(dep => this.resolveOrder(dep, visited, order));

    order.push(target);
    return order;
  }
}

// ------------------- Workflow Engine -------------------
class WorkflowEngine extends EventEmitter {
  constructor() {
    super();
    this.deps = new DependencyGraph();

    // Define task dependencies
    this.deps.addTask("trackCommits", []);
    this.deps.addTask("updateDashboard", ["trackCommits"]);
    this.deps.addTask("notifyUsers", ["updateDashboard"]);

    // Bind event triggers
    this.on("githubEvent", this.handleGitHubEvent.bind(this));
  }

  async run(target, evt) {
    const tasks = this.deps.resolveOrder(target);
    for (const task of tasks) {
      await this.runTaskWithRetry(task, evt, 3);
    }
  }

  async runTaskWithRetry(task, evt, retries) {
    try {
      switch(task) {
        case "trackCommits": await trackCommits(evt); break;
        case "updateDashboard": await updateDashboard(evt); break;
        case "notifyUsers": await notifyUsers(evt); break;
      }
    } catch (err) {
      logEvent("Task Error", { task, error: err.message });
      if (retries > 0) {
        logEvent("Retry Task", { task, retriesLeft: retries - 1 });
        await this.runTaskWithRetry(task, evt, retries - 1);
      }
    }
  }

  handleGitHubEvent(evt) {
    this.run("notifyUsers", evt);
  }
}

// ------------------- Tasks -------------------
async function trackCommits(evt) {
  const user = await User.findById(evt.userId);
  if (!user || !user.accessToken) throw new Error("User token missing");

  const repos = await callGitHubAPI(`https://api.github.com/user/repos`, user.accessToken);
  const today = new Date(evt.date || Date.now());
  today.setHours(0,0,0,0);

  const commitCounts = {};

  for (const repo of repos) {
    const commits = await callGitHubAPI(
      `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?since=${today.toISOString()}`,
      user.accessToken
    );
    commitCounts[repo.name] = commits.length;

    await CommitHistory.findOneAndUpdate(
      { user: user._id, date: today },
      { $inc: { commitCount: commits.length } },
      { upsert: true }
    );
  }

  await GithubStat.findOneAndUpdate(
    { user: user._id, date: today },
    { commits: Object.values(commitCounts).reduce((a,b)=>a+b,0), perRepoCommits: commitCounts },
    { upsert: true }
  );

  logEvent("Commits Tracked", commitCounts);
}

async function updateDashboard(evt) {
  const user = await User.findById(evt.userId);
  const stats = await GithubStat.find({ user: user._id }).sort({ date: -1 }).limit(7);

  const totalCommits = stats.reduce((s,x)=>s+(x.commits||0),0);

  await DashboardSummary.findOneAndUpdate(
    { user: user._id },
    { totalCommits, lastUpdated: new Date() },
    { upsert: true }
  );

  logEvent("Dashboard Updated", { totalCommits });
}

async function notifyUsers(evt) {
  const user = await User.findById(evt.userId);
  const today = new Date(evt.date || Date.now());
  today.setHours(0,0,0,0);

  const stat = await GithubStat.findOne({ user: user._id, date: today });
  if (!stat) return;

  await Notification.create({
    user: user._id,
    message: `📊 Daily GitHub Summary: You made ${stat.commits} commits across ${Object.keys(stat.perRepoCommits || {}).length} repos today.`,
    date: new Date()
  });

  logEvent("User Notified", { commits: stat.commits });
}

// ------------------- Exports -------------------
const workflowEngine = new WorkflowEngine();

module.exports = {
  workflowEngine,
  trackCommits,
  updateDashboard,
  notifyUsers
};
