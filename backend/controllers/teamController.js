import Team  from "../models/Team.js";
import User from "../models/User.js";

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

export const getUserTeams=async(req,res)=>{
    try{
      const userId = req.user._id;
      //"owner","username" replaces the _id field with the username field
      const teams = await Team.find({ members: userId })
        .populate("owner", "username")
        .populate("members", "username");

      res.status(200).json({ success: true, teams });
      //this will return something like this
      //         {
      //   name: "DevSync Squad",
      //   owner: { githubUsername: "neha_v" },
      //   members: [
      //     { githubUsername: "neha_v" },
      //     { githubUsername: "riya_dev" },
      //     { githubUsername: "siya98" }
      //   ]
      // }
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({success:false,message:"Server error"})
    

    }
}