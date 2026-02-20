/*
 what is the most complicated code you have written independently without AI or anyone else's assistance? 
 attach the question as multiline comment above your code and upload the file

 my attempt: workflow engine with 3 events (githubPushEvent, dashboardUpdateEvent, workflowCompleteEvent)
*/

const EventEmitter=require("events")
const axios=require("axios")

//db models
const User=require("../models/User")
const CommitHistory=require("../models/CommitHistory")
const GithubStat=require("../models/GithubStat")
const DashboardSummary=require("../models/DashboardSummary")
const Notification=require("../models/Notification")

//quick logger so we can trace what’s happening
function logEvent(eventName,data={}){
  console.log(new Date().toISOString(),eventName,data)
}

//helper: call GitHub API with retry + exponential backoff
async function callGitHubAPI(url,token,retries=3,backoff=500){
  try{
    const res=await axios.get(url,{headers:{Authorization:`Bearer ${token}`}})
    return res.data
  }catch(err){
    if(retries>0){
      logEvent("api retry",{url,retriesLeft:retries-1,error:err.message})
      await new Promise(r=>setTimeout(r,backoff))
      return callGitHubAPI(url,token,retries-1,backoff*2)
    }
    logEvent("api fail",{url,error:err.message})
    throw err
  }
}

//dependency graph so tasks run in correct order
class DependencyGraph{
  constructor(){this.tasks=new Map()}
  addTask(name,deps=[]){this.tasks.set(name,deps)}
  resolveOrder(name,visited=new Set(),order=[]){
    if(visited.has(name)) return
    visited.add(name)
    const deps=this.tasks.get(name)||[]
    for(const d of deps) this.resolveOrder(d,visited,order)
    order.push(name)
    return order
  }
}

//main workflow engine (listens to events, triggers tasks)
class WorkflowEngine extends EventEmitter{
  constructor(){
    super()
    this.deps=new DependencyGraph()

    //chain: trackCommits -> updateDashboard -> notifyUsers
    this.deps.addTask("trackCommits",[])
    this.deps.addTask("updateDashboard",["trackCommits"])
    this.deps.addTask("notifyUsers",["updateDashboard"])

    //hook up events
    this.on("githubPushEvent",evt=>this.run("trackCommits",evt))
    this.on("dashboardUpdateEvent",evt=>this.run("updateDashboard",evt))
    this.on("workflowCompleteEvent",evt=>this.run("notifyUsers",evt))
  }

  async run(targetTask,evt){
    const tasks=this.deps.resolveOrder(targetTask)
    for(const taskName of tasks){
      await this.runTaskWithRetry(taskName,evt,3)
    }
  }

  async runTaskWithRetry(taskName,evt,retries){
    try{
      switch(taskName){
        case "trackCommits": await trackCommits(evt); break
        case "updateDashboard": await updateDashboard(evt); break
        case "notifyUsers": await notifyUsers(evt); break
      }
    }catch(err){
      logEvent("task err",{taskName,error:err.message})
      if(retries>0){
        logEvent("retry",{taskName,retriesLeft:retries-1})
        await this.runTaskWithRetry(taskName,evt,retries-1)
      }
    }
  }
}

//---------------- Tasks ----------------

//pulls user repos + commits from GitHub and saves into db
async function trackCommits(evt){
  const user=await User.findById(evt.userId)
  if(!user||!user.accessToken) throw new Error("missing github token")

  const repos=await callGitHubAPI("https://api.github.com/user/repos",user.accessToken)
  const today=new Date(evt.date||Date.now()); today.setHours(0,0,0,0)

  const commitCounts={}

  for(const repo of repos){
    const commits=await callGitHubAPI(
      `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?since=${today.toISOString()}`,
      user.accessToken
    )
    commitCounts[repo.name]=commits.length

    // store commit history per day
    await CommitHistory.findOneAndUpdate(
      {user:user._id,date:today},
      {$inc:{commitCount:commits.length}},
      {upsert:true}
    )
  }

  //aggregate stats for dashboard
  await GithubStat.findOneAndUpdate(
    {user:user._id,date:today},
    {commits:Object.values(commitCounts).reduce((a,b)=>a+b,0),perRepoCommits:commitCounts},
    {upsert:true}
  )

  logEvent("commits tracked",commitCounts)
}

//aggregates last 7 days + updates dashboard summary
async function updateDashboard(evt){
  const user=await User.findById(evt.userId)
  const stats=await GithubStat.find({user:user._id}).sort({date:-1}).limit(7)
  const totalCommits=stats.reduce((sum,stat)=>sum+(stat.commits||0),0)

  await DashboardSummary.findOneAndUpdate(
    {user:user._id},
    {totalCommits,lastUpdated:new Date()},
    {upsert:true}
  )

  logEvent("dashboard updated",{totalCommits})
}

//sends a daily summary notification to user
async function notifyUsers(evt){
  const user=await User.findById(evt.userId)
  const today=new Date(evt.date||Date.now()); today.setHours(0,0,0,0)
  const stat=await GithubStat.findOne({user:user._id,date:today})
  if(!stat) return

  await Notification.create({
    user:user._id,
    message:`Daily summary: ${stat.commits} commits across ${Object.keys(stat.perRepoCommits||{}).length} repos`,
    date:new Date()
  })

  logEvent("user notified",{commits:stat.commits})
}

//export engine + tasks
const workflowEngine=new WorkflowEngine()
module.exports={workflowEngine,trackCommits,updateDashboard,notifyUsers}
