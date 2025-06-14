const jwt=require("jsonwebtoken")
const User = require("../models/User")

const verifyToken=async (req,res,next)=>{
    const token=req.cookies.token
    if(!token)
    {
        return res.status(401).json({msg:"No token found"})

    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findById(decoded.id)
if(!user)
{
    return res.status(404).json({ msg: "User not found" });
}
req.user=user
        next()
    }
    catch(err)
    {
        return res.status(401).json({msg:"Invalid token"})
    }
}

module.exports=verifyToken