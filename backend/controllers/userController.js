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

const searchUsersByUsername=async (req,res)=>{
    try{
        const query=req.query.query
        if(!query || query.trim()==="")
        {
            return res.status(400).json({
                message:"Please enter a valid query"
            })
        }
        else{
            const users=await User.find({
                username:{$regex:query,$options:"i"}
            }).select("username");
        }
        res.json({success:true,users})

    }
    catch(err)
    {
        console.error(err)
        res.status(500).json({
            message:"Internal server error"
        })
    }
}

module.exports={
    getUserProfile,
    logout,
    searchUsersByUsername
}