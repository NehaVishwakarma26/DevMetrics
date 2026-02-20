/*
 what is the most complicated code you have written independently without AI or anyone else's assistance? 
 attach the question as multiline comment above your code and upload the file

 my attempt: workflow engine with 3 events (githubPushEvent, dashboardUpdateEvent, workflowCompleteEvent)
*/

const EventEmitter=require("events")
const axios=require("axios")

const User=require("../models/User")
const CommitHistory=require("../models/CommitHistory")
const GithubStat=require("../models/GithubStat")
const DashboardSummary=require("../models/DashboardSummary")
const Notification=require("../models/Notification")

//basic logger
function logEvent(ev,data={}){
  console.log(new Date().toISOString(),ev,data)
}

//github api call with retry/backoff
async function callGitHubAPI(url,token,retries=3,backoff=500){
  try{
    const res=await axios.get(url,{headers:{Authorization:`Bearer ${token}`}})
    return res.data
  }catch(err){
    if(retries>0){
      logEvent("api retry",{url,retriesLeft:retries-1,err:err.message})
      await new Promise(r=>setTimeout(r,backoff))
      return callGitHubAPI(url,token,retries-1,backoff*2)
    }
    logEvent("api fail",{url,err:err.message})
    throw err
  }
}

//tiny dep graph
class DependencyGraph{
  constructor(){this.g=new Map()}
  addTask(t,deps=[]){this.g.set(t,deps)}
  resolveOrder(t,visited=new Set(),order=[]){
    if(visited.has(t)) return
    visited.add(t)
    const deps=this.g.get(t)||[]
    for(const d of deps) this.resolveOrder(d,visited,order)
    order.push(t)
    return order
  }
}

//workflow engine
class WorkflowEngine extends EventEmitter{
  constructor(){
    super()
    this.deps=new DependencyGraph()
    // deps chain
    this.deps.addTask("trackCommits",[])
    this.deps.addTask("updateDashboard",["trackCommits"])
    this.deps.addTask("notifyUsers",["updateDashboard"])

    // events
    this.on("githubPushEvent",evt=>this.run("trackCommits",evt))
    this.on("dashboardUpdateEvent",evt=>this.run("updateDashboard",evt))
    this.on("workflowCompleteEvent",evt=>this.run("notifyUsers",evt))
  }

  async run(target,evt){
    const tasks=this.deps.resolveOrder(target)
    for(const t of tasks){
      await this.runTaskWithRetry(t,evt,3)
    }
  }

  async runTaskWithRetry(t,evt,retries){
    try{
      switch(t){
        case "trackCommits": await trackCommits(evt); break
        case "updateDashboard": await updateDashboard(evt); break
        case "notifyUsers": await notifyUsers(evt); break
      }
    }catch(err){
      logEvent("task err",{t,err:err.message})
      if(retries>0){
        logEvent("retry",{t,retriesLeft:retries-1})
        await this.runTaskWithRetry(t,evt,retries-1)
      }
    }
  }
}

//tasks
async function trackCommits(evt){
  const user=await User.findById(evt.userId)
  if(!user||!user.accessToken) throw new Error("no token")

  const repos=await callGitHubAPI("https://api.github.com/user/repos",user.accessToken)
  const today=new Date(evt.date||Date.now()); today.setHours(0,0,0,0)

  const commitCounts={}

  for(const repo of repos){
    const commits=await callGitHubAPI(
      `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?since=${today.toISOString()}`,
      user.accessToken
    )
    commitCounts[repo.name]=commits.length

    await CommitHistory.findOneAndUpdate(
      {user:user._id,date:today},
      {$inc:{commitCount:commits.length}},
      {upsert:true}
    )
  }

  await GithubStat.findOneAndUpdate(
    {user:user._id,date:today},
    {commits:Object.values(commitCounts).reduce((a,b)=>a+b,0),perRepoCommits:commitCounts},
    {upsert:true}
  )

  logEvent("commits tracked",commitCounts)
}

async function updateDashboard(evt){
  const user=await User.findById(evt.userId)
  const stats=await GithubStat.find({user:user._id}).sort({date:-1}).limit(7)
  const total=stats.reduce((s,x)=>s+(x.commits||0),0)

  await DashboardSummary.findOneAndUpdate(
    {user:user._id},
    {totalCommits:total,lastUpdated:new Date()},
    {upsert:true}
  )

  logEvent("dashboard updated",{total})
}

async function notifyUsers(evt){
  const user=await User.findById(evt.userId)
  const today=new Date(evt.date||Date.now()); today.setHours(0,0,0,0)
  const stat=await GithubStat.findOne({user:user._id,date:today})
  if(!stat) return

  await Notification.create({
    user:user._id,
    message:`daily summary: ${stat.commits} commits across ${Object.keys(stat.perRepoCommits||{}).length} repos`,
    date:new Date()
  })

  logEvent("user notified",{commits:stat.commits})
}

//export
const workflowEngine=new WorkflowEngine()
module.exports={workflowEngine,trackCommits,updateDashboard,notifyUsers}
