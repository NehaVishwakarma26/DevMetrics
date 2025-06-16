import Team  from "../models/Team";
import User from "../models/User";

//create a team
export const createTeam=async (req,res)=>{
    try{
        const {name,memberUsernames}=req.body;
        const ownerId=req.user._id;
//find all users in the User collection whose username is in the array memberUsernames
        const members=await User.find({username:{$in:memberUsernames}})

        const team=await Team.create({
            name,
            owner:ownerId,
            members:members.map(user=>user._id)
        })

        res.status(201).json({success:true,team})
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({success:false,message:"Server error"})
    }
}