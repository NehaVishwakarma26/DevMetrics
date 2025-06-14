const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/authMiddleware");
const {
  setOrUpdateGoal,
  getUserGoal,
  deleteGoal,
  getGoalHistory,
  checkGoalCompletion
} = require("../controllers/goalController");

router.use(requireAuth); // Protect routes

router.get("/", getUserGoal); 
router.post("/set", setOrUpdateGoal); 
router.delete("/", deleteGoal); 
router.get("/history", getGoalHistory);
router.get("/check",checkGoalCompletion)

module.exports = router;
