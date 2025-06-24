const express = require("express");
const {
  createTeam,
  getUserTeams,
  validateUsernames,
  getTeamData,
  getTeamActivityInsights,
  sevenDayContribution,
  updateTeamName,
  updateRepo,
  inviteMember,
  deleteTeam,

  removeMember,
  fetchSuggestions
} = require("../controllers/teamController.js");
const requireAuth =require( "../middlewares/authMiddleware.js");

const router=express.Router();

router.post("/create",requireAuth,createTeam);
router.get("/my",requireAuth,getUserTeams)
router.post("/validate",requireAuth,validateUsernames)
router.get("/getTeamData/:id",requireAuth,getTeamData)
router.post("/activityInsights/:teamId",requireAuth,getTeamActivityInsights)
router.post("/sevenDayContribution/:teamId", requireAuth, sevenDayContribution);
router.post("/updateTeamName/:teamId",requireAuth,updateTeamName)
router.post("/updateRepo/:teamId", requireAuth, updateRepo);
router.post("/inviteMember/:teamId",requireAuth,inviteMember)
router.post("/removeMember/:teamId",requireAuth,removeMember)
router.delete("/deleteTeam/:teamId",requireAuth,deleteTeam)
router.post("/generate-sprint-summary",requireAuth,fetchSuggestions);
module.exports = router;