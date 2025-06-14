const express=require("express")
const router=express.Router()
const {getUserProfile,logout}=require("../controllers/userController")

const requireAuth=require("../middlewares/authMiddleware")

router.get("/me",requireAuth,getUserProfile)
router.post("/logout",requireAuth,logout)

module.exports=router