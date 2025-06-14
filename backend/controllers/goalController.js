const Goal = require("../models/Goal");
const GoalHistory = require("../models/goalHistory");
const GitHubStat=require("../models/GitHubStat")
// Set or Update Daily Commit & Weekly PR Goals
const setOrUpdateGoal = async (req, res) => {
  const userId = req.user._id;
  const { dailyCommitGoal, weeklyPRGoal } = req.body;

  try {
    let goal = await Goal.findOne({ user: userId });

    if (goal) {

const todayDate=new Date().toISOString().split("T")[0]
const todayCommits=await GitHubStat.find({user:userId,date:todayDate});

const todayCommitCount=todayCommits.length>0?todayCommits[0].commits:0;
const dailyComplete = todayCommitCount >= goal.dailyCommitGoal;

const sevenDaysAgo=new Date()
sevenDaysAgo.setDate(sevenDaysAgo.getDate()-7)
const pastWeekStats=await GitHubStat.find({
  user:userId,
  date:{$gte:sevenDaysAgo.toISOString().split("T")[0]}
})

const totalPRs=pastWeekStats.reduce((acc,stat)=>acc+(stat.pullRequests||0),0);
const weeklyComplete = totalPRs >=goal.weeklyPRGoal

if (!dailyComplete || !weeklyComplete) {
  return res.status(400).json({
    message: "Current goal not completed yet. Complete it before setting a new one.",
    dailyComplete,
    weeklyComplete
  });
}

      goal.dailyCommitGoal = dailyCommitGoal;
      goal.weeklyPRGoal = weeklyPRGoal;
      await goal.save();
    } else {
      goal = await Goal.create({
        user: userId,
        dailyCommitGoal,
        weeklyPRGoal
      });
    }

    // Log to history collection
    await GoalHistory.create({
      user: userId,
      dailyCommitGoal,
      weeklyPRGoal,
      updatedAt: new Date()
    });

    res.status(200).json(goal);
  } catch (err) {
    res.status(500).json({ message: "Failed to set/update goal", error: err.message });
  }
};

// Get current user's goal
const getUserGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user._id })

    if (!goal) {
      return res.status(404).json({ message: "No goal found" });
    }

    res.status(200).json(goal);
  } catch (err) {
    res.status(500).json({ message: "Error fetching goal", error: err.message });
  }
};

// Delete current user's goal
const deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting goal", error: err.message });
  }
};

// Get goal history (sorted by latest first)
const getGoalHistory = async (req, res) => {
  try {
    const history = await GoalHistory.find({ user: req.user._id }).sort({updatedAt:-1})
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Error fetching goal history", error: err.message });
  }
};

const checkGoalCompletion=async(req,res)=>{
  try{
    const goal=await Goal.findOne({user:req.user._id})
    if(!goal)
    {
      return res.status(404).json({message:"No goals found"})

    }

    const today=new Date().toISOString().split("T")[0]
    const todayStat=await GitHubStat.findOne({user:req.user._id,date:today})

    const dailyComplete=todayStat && todayStat.commits>=goal.dailyCommitGoal;

    const sevenDaysAgo=new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate()-7)

    const weeklyStats=await GitHubStat.find({
      user:req.user._id,
      date:{$gte:sevenDaysAgo.toISOString().split("T")[0]}
    })

    const totalPRs=weeklyStats.reduce((acc,stat)=>acc+(stat.pullRequests||0),0)

const weeklyComplete = totalPRs >= goal.weeklyPRGoal;


    if (dailyComplete && weeklyComplete) {
  return res.status(200).json({ completed: true, message: "Goal achieved!" });
} else {
  return res.status(200).json({
    completed: false,
    message: "Goal not yet completed",
    dailyComplete,
    weeklyComplete
  });
}

    
  }

  catch(err)
  {
    res.status(500).json({message:"Error checking goal completion",error:err.message})
  }
}

const getWeeklyPRStats = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // inclusive of today

    const stats = await GitHubStat.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo.toISOString().split("T")[0] }
    }).sort({ date: 1 });

    const formatted = stats.map(stat => ({
      date: stat.date.toISOString().split("T")[0],
      pullRequests: stat.pullRequests || 0
    }));

    res.status(200).json({ data: formatted });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch PR stats", error: err.message });
  }
};


module.exports = {
  setOrUpdateGoal,
  getUserGoal,
  deleteGoal,
  getGoalHistory,
  checkGoalCompletion,
  getWeeklyPRStats
};
