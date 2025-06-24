const Team  =require( "../models/Team.js");
const  User= require("../models/User.js");

const GithubStat=require("../models/GitHubStat.js");
const { fetchAndSaveGithubStats } = require("./githubDataController.js");

//create a team
 const createTeam=async (req,res)=>{
    try{
        const {name,memberUsernames,repo}=req.body;
        const ownerId=req.user._id;
//find all users in the User collection whose username is in the array memberUsernames
        const members=await User.find({username:{$in:memberUsernames}})

        const team=await Team.create({
            name,
            owner:ownerId,
            members:members.map(user=>user._id),
            repo
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

const getTeamData=async (req,res)=>{
    try{
        const team=await Team.findById(req.params.id).populate("members","username avatar").populate("owner","username avatar")
        if(!team) return res.status(404).json({error:"Team not found"})
console.log(team)
res.json({team,currentUserId:req.user._id})

    }
    catch(err)
    {
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
    }
}



const getTeamActivityInsights = async (req, res) => {
  try {
    const { teamId } = req.params;
    let { repo } = req.body;

    // Normalize repo name
    repo = repo?.split("/")?.[1]?.trim()?.toLowerCase();

    const team = await Team.findById(teamId).populate("members", "_id");
    if (!team) return res.status(404).json({ error: "Team not found" });

    const memberIds = team.members.map((m) => m._id);

    // Sync stats for past 7 days
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);

      for (const memberId of memberIds) {
        const member = await User.findById(memberId);
        if (member?.accessToken) {
          try {
            await fetchAndSaveGithubStats(member, targetDate);
          } catch (err) {
            console.log(`Failed to sync ${member.username} on ${targetDate.toISOString().split("T")[0]}`);
          }
        }
      }
    }

    // Fetch stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const stats = await GithubStat.find({
      user: { $in: memberIds },
      date: { $gte: sevenDaysAgo },
    });

    let totalCommits = 0;
    let totalPRs = 0;

    stats.forEach((s) => {
   
if (repo && s.perRepoCommits instanceof Map && s.perRepoPRs instanceof Map) {
  const commitKeys = Array.from(s.perRepoCommits.keys());
  const prKeys = Array.from(s.perRepoPRs.keys());

  for (const key of commitKeys) {
    if (key.trim().toLowerCase() === repo) {
      totalCommits += s.perRepoCommits.get(key) || 0;
    }
  }

  for (const key of prKeys) {
    if (key.trim().toLowerCase() === repo) {
      totalPRs += s.perRepoPRs.get(key) || 0;
    }
  }
} else {
  totalCommits += s.commits || 0;
  totalPRs += s.pullRequests || 0;
}


    });

    res.json({ totalCommits, totalPRs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const sevenDayContribution = async (req, res) => {
  try {
    const { teamId } = req.params;
    let { repo } = req.body;

    // Normalize repo name
    repo = repo?.split("/")?.[1]?.trim()?.toLowerCase();
    console.log("Normalized Repo from Frontend:", repo);

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const memberIds = team.members.map((member) => member._id);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const memberStats = [];

    for (let memberId of memberIds) {
      const memberData = await User.findById(memberId);
      const stats = await GithubStat.find({
        user: memberId,
        date: { $gte: sevenDaysAgo },
      });

     const filteredStats = stats.map((s) => {
  let commitCount = 0;
  let prCount = 0;

  if (repo && s.perRepoCommits instanceof Map && s.perRepoPRs instanceof Map) {
    const commitKeys = Array.from(s.perRepoCommits.keys());
    const prKeys = Array.from(s.perRepoPRs.keys());

    for (const key of commitKeys) {
      if (key.trim().toLowerCase() === repo) {
        commitCount = s.perRepoCommits.get(key) || 0;
      }
    }

    for (const key of prKeys) {
      if (key.trim().toLowerCase() === repo) {
        prCount = s.perRepoPRs.get(key) || 0;
      }
    }
  } else {
    commitCount = s.commits || 0;
    prCount = s.pullRequests || 0;
  }

  return {
    date: s.date,
    commits: commitCount,
    pullRequests: prCount,
    issues: s.issues || 0,
  };
});

      memberStats.push({ memberData, stats: filteredStats });
    }

    res.status(200).json({ message: "Fetched data", data: memberStats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const axios=require("axios")

const fetchSuggestions = async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const suggestion =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ success: true, summary: suggestion });
  } catch (err) {
    console.error("Error from Gemini API:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Gemini API request failed" });
  }
};



//for team admins
//update, invite,remove,delete

const updateTeamName=async (req,res)=>{
    try{
        const {name}=req.body;
        const team=await Team.findById(req.params.teamId)
        if(!team)
        {
            return res.status(404).json({success:false,message:"Team not found"})
        }
console.log("team owner",team.owner._id.toString())
console.log("req user",req.user._id.toString())
console.log(team.owner._id!==req.user._id)
if(team.owner._id.toString()!==req.user._id.toString())
{
    return res.status(403).json({success:false,message:"You are not the owner of this team"})
}
        team.name=name;
        await team.save()
        res.status(200).json({message:"Team name updated",data:team})
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({success:false,message:"Server error"})
    
    }
}

const inviteMember=async(req,res)=>{
    try{
        const {teamId}=req.params;
        const username=req.body.username.trim()

        const team=await Team.findById(teamId)
       
if(team.owner._id.toString()!==req.user._id.toString())
{
    return res.status(403).json({success:false,message:"You are not the owner of this team"})
}

        const user=await User.findOne({username})
        if(!user)
        {
            return res.status(404).json({success:false,message:"User not found"})
        }

        const alreadyMember=team.members.find(member=>member._id.toString()==user._id.toString())
        if(alreadyMember)
        {
            return res.status(403).json({success:false,message:"User is already a member of this"})
        }
        else{
            team.members.push(user._id)
        }

        await team.save()
        res.status(200).json({message:"User invited",data:team})
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({success:false,message:"Server error"})
    }
}

const removeMember = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const username = req.body.username;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not the owner of this team" });
    }

    const userToRemove = await User.findOne({ username });
    if (!userToRemove) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user is in team
    const isMember = team.members.some((id) => id.toString() === userToRemove._id.toString());
    if (!isMember) {
      return res.status(404).json({ success: false, message: "User is not a member of this team" });
    }

    // Remove user
    team.members = team.members.filter((id) => id.toString() !== userToRemove._id.toString());
    await team.save();

    res.status(200).json({ message: "User removed", data: team });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const deleteTeam=async(req,res)=>{
    try{
        const teamId=req.params.teamId;
        const team=await Team.findById(teamId)
        if(!team)
        {
            return res.status(404).json({success:false,message:"Team not found"})
        }
if(team.owner._id.toString()!==req.user._id.toString())
{
    return res.status(403).json({success:false,message:"You are not the owner of this team"})
}

await Team.findByIdAndDelete(teamId)
res.status(200).json({message:"Team deleted"})
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({success:false,message:"Server error"})
    }
}

const updateRepo=async(req,res)=>{
    try{
const teamId=req.params.teamId
const team=await Team.findById(teamId)
if(!team)
{
    return res.status(404).json({success:false,message:"Team not found"})
}

if(req.user._id.toString()!==team.owner.toString())
{
    return res.status(403).json({success:false,message:"You are not the owner of this team"})
}

const {repo}=req.body;
await Team.findByIdAndUpdate(teamId,{repo})
res.status(200).json({message:"Repo updated"})
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({success:false,message:"Server error"})
    }
}


module.exports = { createTeam, getUserTeams, validateUsernames ,getTeamData,getTeamActivityInsights,sevenDayContribution,updateRepo,updateTeamName,deleteTeam,inviteMember,removeMember,fetchSuggestions};