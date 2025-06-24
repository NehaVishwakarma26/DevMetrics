const express=require("express")
const router=express.Router()
const {githubLogin,githubCallback,logout,syncGithubStats}=require("../controllers/githubController")

const requireAuth=require("../middlewares/authMiddleware")

router.get("/login",githubLogin)
router.get("/callback",githubCallback)
router.post("/logout",requireAuth,logout)
router.get("/sync", requireAuth, syncGithubStats);

module.exports=router