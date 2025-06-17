const Team  =require( "../models/Team.js");
const  User= require("../models/User.js");

//create a team
 const createTeam=async (req,res)=>{
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

const getUserTeams=async(req,res)=>{
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

const validateUsernames=async (req,res)=>{
    try{
        //get the username array
        const {usernames}=req.body;
//check if usernames is an array
if(!Array.isArray(usernames))
{
    return res.status(400).json({success:false,message:"Invalid Input"})

}

//search the db for all users whose username is in the provided array
const foundUsers=await User.find({username:{$in:usernames}}).select("username")

//convert the list of valid usernames into a set for fast lookup
const foundSet=new Set(foundUsers.map((u)=>u.username))

//loop thru the original input list n collect any usernames not found in the db
const invalidUsernames=usernames.filter((u)=>!foundSet.has(u))

if(invalidUsernames.length>0)
{
    return res.status(400).json({success:false,invalidUsernames})
}
res.status(200).json({success:true})
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({success:false,message:"Server error"})
    }
}

module.exports = { createTeam, getUserTeams, validateUsernames };