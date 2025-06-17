const express = require("express");
const { createTeam, getUserTeams,validateUsernames} = require("../controllers/teamController.js")
const requireAuth =require( "../middlewares/authMiddleware.js");

const router=express.Router();

router.post("/create",requireAuth,createTeam);
router.get("/my",requireAuth,getUserTeams)
router.post("/validate",requireAuth,validateUsernames)
module.exports = router;