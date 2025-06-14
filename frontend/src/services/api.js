import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // sends JWT cookie
});

// ----------- Auth -----------
export const getCurrentUser = () => API.get("/users/me");

// ----------- Analytics -----------
export const getAnalytics = () => API.get("/analytics");

// ----------- Goals -----------
export const getGoal = () => API.get("/goals");
export const setOrUpdateGoal = (goalData) => API.post("/goals/set", goalData);
export const deleteGoal = () => API.delete("/goals");
export const getGoalHistory = () => API.get("/goals/history");

// ----------- Add more modules as needed -----------
export const getGithubProfile = () => API.get("/githubData/github/profile");
export const getGithubRepos = () => API.get("/githubData/github/repos");
export const trackCommits = () => API.get("/githubData/github/commitHistory");

export const getHeatmapAndStreaks = () => API.get("/githubData/github/heatmap?sinceDays=365");

export default API;
