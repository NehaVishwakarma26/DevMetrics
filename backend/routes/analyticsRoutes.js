const {getUserAnalytics}=require("../controllers/analyticsController")
const express = require("express");
const router=express.Router()
const requireAuth=require("../middlewares/authMiddleware")


router.get("/",requireAuth,getUserAnalytics);

module.exports=router