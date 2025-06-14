const User=require("../models/User")

const getUserProfile=async(req,res)=>{
    res.status(200).json({
        message:"User profile fetched successfully",
        user:req.user
    })
}

const logout= (req,res)=>{
    res.clearCookie("token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
});
    res.status(200).json({
        message:"User logged out successfully"
    })
}
module.exports={
    getUserProfile,
    logout
}