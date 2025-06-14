import React from 'react'
import CommitsBarChart from './Components/CommitsBarChart'
import TodayProgress from './Components/TodayProgress'
import WeeklyLineChart from './Components/WeeklyLineChart'
import StreakStats from './Components/StreakStats'
import {trackCommits,getGoal} from "../../services/api"
import { useState,useEffect } from 'react'
import ContributionHeatmap from './Components/ContributionHeatmap'
import WeeklyPRLineChart from './Components/WeeklyPRLineChart'
import ProductivityScoreCard from './Components/ProductivityScoreCard'
import SmartSuggestions from './Components/SmartSuggestions'
const Stats = () => {
const [commits,setCommits]=useState([])
const [lastSevenDaysCommits,setLastSevenDaysCommits]=useState([])
const [todayCommits,setTodayCommits]=useState(0)
const [currentGoal,setCurrentGoal]=useState(null)
const [weeklyCommitCount,setWeeklyCommitCount]=useState([])

useEffect(()=>{
fetchData()
  getcurrgoal()

},[])

//runs whenever commits is updated
useEffect(()=>{
  lastSevenDays()
  todayCommitCount()
  getWeeklyCommitCount()
},[commits])

//fetch all the commit history
const fetchData=async()=>{
  try{
 const response=await trackCommits()
  setCommits(response.data.commitCounts)
  }
  catch(err)
  {
    console.log(err)
  }
 
}

const lastSevenDays=async ()=>{
  //current date
  const today = new Date();

  const sevenDaysAgo = new Date();
  //date seven days before today
  sevenDaysAgo.setDate(today.getDate() - 7);
  const entries = Object.entries(commits);

  //filter the entries that are between today and seven days ago
  const filtered = entries
    .filter(([date]) => new Date(date) >= sevenDaysAgo)
    .map(([date, count]) => ({ date, commits: count }));

  setLastSevenDaysCommits(filtered);
  console.log(filtered);
  return filtered;
}

const todayCommitCount=()=>{
  const entries=Object.entries(commits)
  const todayString=new Date().toISOString().split("T")[0]
  const todayCount=entries.find(([date])=>date===todayString)
  if(todayCount)
  setTodayCommits(todayCount[1])
else
setTodayCommits(0)
}

const getcurrgoal=async ()=>{
  console.log("🟡 getcurrgoal triggered");

try{
const goalRes=await getGoal()
if(goalRes)
{
  setCurrentGoal(goalRes.data)
  console.log(goalRes.data);
}
}
catch(err)
{
  console.log(err);
}
}

const getWeeklyCommitCount=async()=>{
  try{
    const today = new Date();
    const weekStart = new Date();
    const day = weekStart.getDay(); //gives the day number like sunday 0 monday 1
    const daysToSubtract = day === 0 ? 6 : day - 1;
    weekStart.setDate(weekStart.getDate() - daysToSubtract);
    //loop throught the commits and count the commits between weekstart and today
    const entries = Object.entries(commits);

   const weeklyData = [];

for (let i = 0; i < 7; i++) {
  const current = new Date(weekStart);
  current.setDate(weekStart.getDate() + i); // gets each day of the week

  const dateStr = current.toISOString().split("T")[0]; // 'YYYY-MM-DD'

  const commitEntry = entries.find(([date]) => date === dateStr);

  const dayShort = current.toLocaleString('en-US', { weekday: 'short' }); // 'Mon', 'Tue'...

  weeklyData.push({
    date: dayShort,
    commits: commitEntry ? commitEntry[1] : 0,
  });
}
setWeeklyCommitCount(weeklyData);
  }
  catch(err)
  {
    console.log(err)
  }
}
return (
  <div style={{ fontFamily: "Hubot Sans" }} className="px-4 py-6 space-y-6">
    
    {/* Top Section: Productivity + TodayProgress */}
    <div className="flex flex-col md:flex-row gap-6 justify-between">
      <div className="flex-1">
        <ProductivityScoreCard />
      </div>
      {currentGoal && (
        <div className="flex-1">
          <TodayProgress
            todayCommits={todayCommits}
            dailyGoal={currentGoal.dailyCommitGoal}
          />
        </div>
      )}
    </div>

    {/* Mid Section: Commits bar + Weekly line chart */}
    <div className="flex flex-col md:flex-row gap-6 justify-between">
      <div className="flex-1">
        <CommitsBarChart commitCounts={lastSevenDaysCommits} />
      </div>
      <div className="flex-1">
        <WeeklyLineChart commits={weeklyCommitCount} />
      </div>
    </div>

    {/* Weekly PR Line Chart */}
    <WeeklyPRLineChart commits={commits} />

    {/* Streak Stats */}
    <StreakStats commits={commits} />

    {/* Smart Suggestions */}
    {currentGoal && <SmartSuggestions />}
  </div>
);

}

export default Stats
