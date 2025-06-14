import axios from "axios";

const API = axios.create({
  baseURL: "https://devmetrics-api.onrender.com/api",
  withCredentials: true, // sends JWT cookie
});

// ----------- Auth -----------
export const getCurrentUser = () => API.get("/users/me");

// ----------- Analytics -----------
export const getAnalytics = () => API.get("/analytics");

export const getProductivityScore = () => API.get("/analytics/productivity-score");

// ----------- Goals -----------
export const getGoal = () => API.get("/goals");
export const setOrUpdateGoal = (goalData) => API.post("/goals/set", goalData);
export const deleteGoal = () => API.delete("/goals");
export const getGoalHistory = () => API.get("/goals/history");

export const getWeeklyPRStats = () => API.get("/githubData/pr-stats-week");

// ----------- Add more modules as needed -----------
export const getGithubProfile = () => API.get("/githubData/github/profile");
export const getGithubRepos = () => API.get("/githubData/github/repos");
export const trackCommits = () => API.get("/githubData/github/commitHistory");

export const getHeatmapAndStreaks = () => API.get("/githubData/github/heatmap?sinceDays=365");
// ---------- Insight --------------------------
export const getSmartSuggestions=()=>API.get("/analytics/smart-suggestions")
export default API;
