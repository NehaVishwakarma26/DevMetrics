const {getUserAnalytics,getProductivityScore}=require("../controllers/analyticsController")
const {getSmartSuggestions} =require("../controllers/insightController")
const express = require("express");
const router=express.Router()
const requireAuth=require("../middlewares/authMiddleware")


router.get("/",requireAuth,getUserAnalytics);
router.get("/productivity-score", requireAuth, getProductivityScore);
router.get("/smart-suggestions",requireAuth,getSmartSuggestions)

module.exports=router