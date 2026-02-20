/**
 * Workflow Engine for Multi-User GitHub Analytics
 * Question:
 * What is the most complicated code you have written independently
 * without AI or anyone else's assistance? Attach the question as a
 * multiline comment above your code and upload the file.
 * Overview:
 * This module implements an event-driven workflow engine that processes
 * GitHub commit events and orchestrates multiple downstream tasks in
 * dependency order.
 *
 */

const EventEmitter=require("events")
const axios=require("axios")
const GitHubStat=require("../models/GitHubStat")
const CommitHistory=require("../models/CommitHistory")
const Notification=require("../models/Notification")
const Reminder=require("../models/Reminder")
const DashboardSummary=require("../models/DashboardSummary")

//github api with retry
async function callGitHubAPI(ep,token,retries=3,backoff=500) {
  try {
    const res=await axios.get(`https://api.github.com${ep}`,{
      headers:{Authorization:`Bearer ${token}`}
    })
    return res.data
  } catch(err) {
    if (err.response?.status===403&&err.response?.headers["x-ratelimit-remaining"]==="0") {
      const reset=err.response.headers["x-ratelimit-reset"]
      const wait=reset*1000-Date.now()
      await new Promise(r=>setTimeout(r,wait))
      return callGitHubAPI(ep,token,retries,backoff)
    }

    if (retries>0) {
      await new Promise(r=>setTimeout(r,backoff))
      return callGitHubAPI(ep,token,retries-1,backoff*2)
    }
    throw err
  }
}

//workflow funcs
async function updateMetrics(evt) {
  const commits=await callGitHubAPI(`/repos/${evt.repo}/commits?sha=${evt.branch}`,evt.token)

  const m={
    user:evt.userId,
    repo:evt.repo,
    branch:evt.branch,
    commitCount:commits.length,
    lastCommit:commits[0]?.commit?.message||"none",
    lastCommitter:commits[0]?.commit?.author?.name||"unk",
    lastCommitTime:commits[0]?.commit?.author?.date||null,
    ts:Date.now()
  }

  await GitHubStat.create({user:evt.userId,date:new Date(), contributions:commits.length,commits:commits.length,perRepoCommits:{[evt.repo]:commits.length}})
  const today=new Date()
  today.setHours(0,0,0,0)
  await CommitHistory.updateOne({user:evt.userId,date:today},{$inc:{commitCount:commits.length}},{upsert:true})
  return m
}

async function generateSummary(evt) {
  const commits=await callGitHubAPI(`/repos/${evt.repo}/commits?sha=${evt.branch}&per_page=5`,evt.token)
  const sum=commits.map(c=>({m:c.commit.message,a:c.commit.author.name}))
  await GitHubStat.updateOne({user:evt.userId,date:new Date()},{$set:{last5Commits:sum}},{upsert:true})
  return sum
}

async function notifyTeams(evt) {
  await Notification.create({user:evt.userId,type:"commit_alert",message:`commit in repo ${evt.repo}`,metadata:{repo:evt.repo,branch:evt.branch,commitCount:evt.commitCount}  })}

async function sendReminder(evt) {
  await Reminder.create({ user:evt.userId,message:"daily reminder: check github stats",date:new Date()})}

async function dashboardUpdate(evt) {
  const stats=await GitHubStat.find({user:evt.userId}).sort({date:-1}).limit(7)
  const totalCommits=stats.reduce((s,x)=>s+(x.commits||0),0)
  const totalContributions=stats.reduce((s,x)=>s+(x.contributions||0),0)

  await DashboardSummary.findOneAndUpdate(
    {user:evt.userId},
    {totalCommits,totalContributions,lastUpdated:new Date()},
    {upsert:true}
  )
}

// dep graph
class DependencyGraph {
  constructor() {
    this.g=new Map()
  }
  addDependency(task,deps) {
    this.g.set(task,deps)
  }
  resolveOrder(task,visited=new Set(),order=[]) {
    if (visited.has(task)) return
    visited.add(task)
    const deps=this.g.get(task)||[]
    for(const d of deps) this.resolveOrder(d,visited,order)
    order.push(task)
    return order
  }
}

//workflow engine
class WorkflowEngine extends EventEmitter {
  constructor() {
    super()
    this.deps=new DependencyGraph()

    this.deps.addDependency("generateSummary",["updateMetrics"])
    this.deps.addDependency("notifyTeams",["generateSummary"])
    this.deps.addDependency("sendReminder",["notifyTeams"])
    this.deps.addDependency("dashboardUpdate",["sendReminder"])

    this.on("commit",this.handleCommit.bind(this))
    this.on("chat",this.handleChat.bind(this))
    this.on("manualTrigger",this.handleManual.bind(this))
    this.on("dailySummary",this.handleDailySummary.bind(this))
  }

  async runWorkflow(target,evt) {
    const tasks=this.deps.resolveOrder(target)
    for (const t of tasks) {
      try {
        switch(t) {
          case "updateMetrics":await updateMetrics(evt)
          break
          case "generateSummary":if (evt.commitCount>=5) await generateSummary(evt)
          break
          case "notifyTeams":
            if (evt.commitMessage&&["fix","urgent"].some(k=>evt.commitMessage.toLowerCase().includes(k))) {
              await notifyTeams(evt)
            }
            break
          case "sendReminder": await sendReminder(evt)
          break
          case "dashboardUpdate": await dashboardUpdate(evt)
          break
        }
      } catch(e) {
        try {
             await this.retryTask(t,evt)
             }
        catch(e2) { 
            console.log("retry fail")
         }}}}

  async retryTask(t,evt) {
    console.log("retry task",{t})
    switch(t) {
      case "updateMetrics":return updateMetrics(evt)
      case "generateSummary":return generateSummary(evt)
      case "notifyTeams":return notifyTeams(evt)
      case "sendReminder":return sendReminder(evt)
      case "dashboardUpdate":return dashboardUpdate(evt)
    } }

  handleCommit(evt) {
    this.runWorkflow("dashboardUpdate",evt)
  }
  handleChat(evt) {
    this.runWorkflow("notifyTeams",evt)
  }
  handleManual(evt) {
    if (evt.task==="generateSummary") this.runWorkflow("generateSummary",evt)
    if (evt.task==="sendReminder") this.runWorkflow("sendReminder",evt)
  }
  handleDailySummary(evt) {
    this.runWorkflow("dashboardUpdate",evt)
  }
}

module.exports=new WorkflowEngine()
