import axios from "axios";

const API = axios.create({
  baseURL: "https://devmetrics-api.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  withCredentials: true, // sends JWT cookie
});

// ----------- Auth -----------
export const getCurrentUser = () => API.get("/users/me");
//search by username
export const searchUsersByUsername=(query)=>API.get(`/users/search?query=${query}`)

export const sync=()=>API.get("/github/sync")

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

export const saveStats=()=>API.post("/githubData/github/saveStats");

export const getHeatmapAndStreaks = () => API.get("/githubData/github/heatmap?sinceDays=365");
// ---------- Insight --------------------------
export const getSmartSuggestions=()=>API.get("/analytics/smart-suggestions")

// ----------- Team ----------------------------
export const getUserTeams=()=>API.get("/team/my")

export const createTeam=(data)=>API.post("/team/create",data)

export const getTeamActivityInsights=(teamId,data)=>API.post(`/team/activityInsights/${teamId}`,data)

export const sevenDayContribution=(teamId,data)=>API.post(`/team/sevenDayContribution/${teamId}`,data)

export const updateTeamName=(teamId,data)=>API.post(`/team/updateTeamName/${teamId}`,data)

export const updateRepo = (teamId, data) => API.post(`/team/updateRepo/${teamId}`, data);

export const deleteTeam = (teamId) => API.delete(`/team/deleteTeam/${teamId}`);

export const inviteMember = (teamId, data) =>API.post(`/team/inviteMember/${teamId}`, data);

export const removeMember = (teamId, data) => API.post(`/team/removeMember/${teamId}`, data);

export const getTeamData = (teamId) => API.get(`/team/getTeamData/${teamId}`);

export const fetchSuggestions=(prompt)=>API.post("/team/generate-sprint-summary",{prompt})

//----------------- CHAT ------------------

export const getTeamMessages=(teamId)=>API.get(`/team-message/${teamId}`)

export const saveTeamMessage=(data)=>API.post("/team-message")

export const handleImageUpload = (data) =>
  API.post("/team-message/upload-image", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  export const testUpload = (data) =>
  API.post("/team-message/test-upload", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });


export default API;
