/**
 * Question: What is the most complicated code I have written independently without AI or anyone else's assistance?
 *
 * This file implements a full workflow engine for a multi-user GitHub analytics platform.
 * It handles:
 *  - Real GitHub API calls with retries, rate-limit handling, and exponential backoff.
 *  - Database integration (MongoDB) for storing GitHub stats, notifications, reminders, and daily commit history.
 *  - Event-driven workflow orchestration for commits, chat messages, manual triggers, and daily summaries.
 *  - Multi-step workflows with dependencies (updateMetrics → generateSummary → notifyTeams → sendReminder → dashboardUpdate).
 *  - Conditional triggers based on commit content (urgent/fix keywords) or thresholds (commit count >= 5).
 *  - Priority-based task scheduling via a custom priority queue.
 *  - Dependency resolution using a graph to ensure correct execution order of workflow tasks.
 *  - Automatic retries for failing tasks with logging at every step.
 *  - Real-world problem-solving logic relevant for a Technical Solutions Engineer role:
 *      * API integration and error handling
 *      * Workflow automation and multi-step processes
 *      * Edge-case management
 *      * Logging, monitoring, and database persistence
 *
 * Skills demonstrated:
 *  - Independent, production-grade coding with complex logic.
 *  - Full-stack thinking: API calls, database writes, event-driven architecture, scheduling, and notifications.
 *  - Algorithmic problem-solving with queues, graphs, and workflow prioritization.
 */

const EventEmitter=require("events")
const axios=require("axios")
const mongoose=require("mongoose")

const GitHubStat=require("../models/GitHubStat")
const CommitHistory=require("../models/CommitHistory")
const Notification=require("../models/Notification")
const Reminder=require("../models/Reminder")
const DashboardSummary=require("../models/DashboardSummary")

function logEvent(ev,data={}){console.log(new Date().toISOString(),ev,data)}

//github api call retry plus rate limit
async function callGitHubAPI(ep,token,retries=3,backoff=500){
 try{
  const res=await axios.get(`https://api.github.com${ep}`,{headers:{Authorization:`Bearer ${token}`}})
  logEvent("api ok",{ep})
  return res.data
 }catch(err){
  if(err.response?.status===403 && err.response?.headers["x-ratelimit-remaining"]==="0"){
   const reset=err.response.headers["x-ratelimit-reset"]
   const wait=reset*1000-Date.now()
   logEvent("rate limit",{ep,wait})
   console.log("debug: wait for rate limit",wait)
   await new Promise(r=>setTimeout(r,wait))
   return callGitHubAPI(ep,token,retries,backoff)
  }
  if(retries>0){
   logEvent("retry api",{ep,left:retries-1,err:err.message})
   console.log("debug: retry api",ep)
   await new Promise(r=>setTimeout(r,backoff))
   return callGitHubAPI(ep,token,retries-1,backoff*2)
  }
  logEvent("api fail",{ep,err:err.message})
  throw err
 }
}

//workflow services
async function updateMetrics(evt){
 console.log("debug:updateMetrics start",evt)
 const commits=await callGitHubAPI(`/repos/${evt.repo}/commits?sha=${evt.branch}`,evt.token)
 const m={user:evt.userId,repo:evt.repo,branch:evt.branch,commitCount:commits.length,lastCommit:commits[0]?.commit?.message||"none",lastCommitter:commits[0]?.commit?.author?.name||"unk",lastCommitTime:commits[0]?.commit?.author?.date||null,ts:Date.now()}
 logEvent("metrics done",m)

 await GitHubStat.create({user:evt.userId,date:new Date(),contributions:commits.length,commits:commits.length,perRepoCommits:{[evt.repo]:commits.length}})
 const today=new Date();today.setHours(0,0,0,0)
 await CommitHistory.updateOne({user:evt.userId,date:today},{$inc:{commitCount:commits.length}},{upsert:true})

 return m
}

async function generateSummary(evt){
 console.log("debug:generateSummary start",evt)
 const commits=await callGitHubAPI(`/repos/${evt.repo}/commits?sha=${evt.branch}&per_page=5`,evt.token)
 const sum=commits.map(c=>({m:c.commit.message,a:c.commit.author.name}))
 logEvent("summary done",sum)
 await GitHubStat.updateOne({user:evt.userId,date:new Date()},{ $set:{last5Commits:sum}},{upsert:true})
 return sum
}

async function notifyTeams(evt){
    logEvent("notifyTeams trig",evt);
    await Notification.create(
        {user:evt.userId,type:"commit_alert",
            message:`commit in repo ${evt.repo}`,
            metadata:{repo:evt.repo,branch:evt.branch,commitCount:evt.commitCount}})}
async function sendReminder(evt){
    logEvent("reminder trig",evt)
    await Reminder.create({user:evt.userId,message:"daily reminder: check github stats",date:new Date()})}

async function dashboardUpdate(evt){
 logEvent("dashboard update trig",evt)
 const stats=await GitHubStat.find({user:evt.userId}).sort({date:-1}).limit(7)
 const totalCommits=stats.reduce((s,x)=>s+(x.commits||0),0)
 const totalContributions=stats.reduce((s,x)=>s+(x.contributions||0),0)
 await DashboardSummary.findOneAndUpdate({user:evt.userId},{totalCommits,totalContributions,lastUpdated:new Date()},{upsert:true})
}

//priority queue
class PriorityQueue{
 constructor(){this.q=[]}
 enqueue(t,p) {
    this.q.push({t,p})
 this.q.sort((a,b)=>b.p-a.p)}
 dequeue(){return this.q.shift()?.t}
 isEmpty(){return this.q.length===0}
}

//dependency graph
class DependencyGraph{
 constructor(){this.g=new Map()}
 addDependency(n,deps){this.g.set(n,deps)}
 resolveOrder(n,v=new Set(),o=[])
 {if(v.has(n))return
    v.add(n)
    const d=this.g.get(n)||[]
    for(const dep of d)this.resolveOrder(dep,v,o)
    o.push(n)
    return o}
}

//workflow engine
class WorkflowEngine extends EventEmitter{
 constructor(){
  super()
  this.q=new PriorityQueue()
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

 handleCommit(evt){
  logEvent("commit got",evt)
  const ct=5
  const urgent=["fix","urgent"]
  const genSum=evt.commitCount>=ct
  const shouldNotify=evt.commitMessage && urgent.some(k=>evt.commitMessage.toLowerCase().includes(k))
  const tasks=this.deps.resolveOrder("dashboardUpdate")
  tasks.forEach(t=>{
   switch(t){
    case"updateMetrics":this.q.enqueue(()=>updateMetrics(evt),5);break
    case"generateSummary":if(genSum)this.q.enqueue(()=>generateSummary(evt),4);break
    case"notifyTeams":if(shouldNotify)this.q.enqueue(()=>notifyTeams(evt),3);break
    case"sendReminder":this.q.enqueue(()=>sendReminder(evt),2);break
    case"dashboardUpdate":this.q.enqueue(()=>dashboardUpdate(evt),1);break
   }
  })
  this.process()
 }

 handleChat(evt){
    logEvent("chat got",evt);
    this.q.enqueue(()=>notifyTeams(evt),4);
    this.q.enqueue(()=>dashboardUpdate(evt),2);
    this.process()}

 handleManual(evt){
    logEvent("manual trig",evt);
    if(evt.task==="generateSummary")this.q.enqueue(()=>generateSummary(evt),6);
    if(evt.task==="sendReminder")this.q.enqueue(()=>sendReminder(evt),5);
    this.process()}

 handleDailySummary(evt){
    logEvent("daily sum trig",evt);
    this.q.enqueue(()=>updateMetrics(evt),5);
    this.q.enqueue(()=>generateSummary(evt),4);
    this.q.enqueue(()=>notifyTeams(evt),3);
    this.q.enqueue(()=>sendReminder(evt),2);
    this.q.enqueue(()=>dashboardUpdate(evt),1);
    this.process()}

 async process(){
  while(!this.q.isEmpty()){
   const t=this.q.dequeue()
   try{await t()}catch(e){
    logEvent("task err",{e:e.message});
    console.log("debug: retry task");
    try{await t()}
    catch(e2){
        logEvent("retry fail",{e:e2.message})}}
  }
 }
}

module.exports=new WorkflowEngine()
