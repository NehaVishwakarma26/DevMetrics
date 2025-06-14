import React from 'react'
import { useState, useEffect } from "react"
import {getGoal,getGoalHistory,setOrUpdateGoal,deleteGoal} from "../services/api"

const Goals = () => {

const [dailyCommitGoal,setDailyCommitGoal]=useState("")
const [weeklyPRGoal,setWeeklyPRGoal]=useState("")
const [currentGoal,setCurrentGoal]=useState(null)
const [goalHistory,setGoalHistory]=useState([])
const [message,setMessage]=useState("")
const [loading,setLoading]=useState(true)

const fetchData=async()=>{
setLoading(true)
try{
  const goalRes=await getGoal()
  if(goalRes)
  {
    setCurrentGoal(goalRes.data);
  }

 
}catch(err)
{
  console.log(err);
  if(err.response?.status===404)
    setCurrentGoal(null)
  else
  setMessage(err.message)
}
try{
   const goalHistoryRes=await getGoalHistory()
  if(goalHistoryRes)
  {
    setGoalHistory(goalHistoryRes.data)
  }
  console.log(goalHistory)
}
catch(err)
{
  console.log(err);
  setMessage(err.message)
}
setLoading(false)
}



useEffect(()=>{



fetchData()

},[])

const handleSubmit=async(e)=>{
  e.preventDefault();
const numCommits=Number(dailyCommitGoal)
const numPRs=Number(weeklyPRGoal)
setLoading(true)
try{

if(numCommits<1 || numPRs<1)
{
  setMessage("Please enter a number greater than 0")
  return
}
else{
  await setOrUpdateGoal({dailyCommitGoal:numCommits,weeklyPRGoal:numPRs})
  setMessage("Goal Created Successfully")
    setDailyCommitGoal("")
  setWeeklyPRGoal("")
  await fetchData()

}

}
catch(err)
{
  console.log(err);
  setMessage(err.message)
}
finally{
  setLoading(false)
}

}

//delete the current goal
const handleDelete=async (e)=>{
  e.preventDefault()

try{
  await deleteGoal()
  setMessage("Goal Deleted Successfully")
  await fetchData()
  setCurrentGoal(null)
  setDailyCommitGoal("")
  setWeeklyPRGoal("")
}
catch(err)
{
  setMessage(err.message)
}


}

  return (
    <div
      className="min-h-screen text-white p-6 bg-gray-800
     "
      style={{ fontFamily: "Hubot Sans" }}
    >
      {loading && (
        <div className="mb-4 p-4 bg-blue-500 text-white rounded-md shadow-md animate-pulse">
          Loading...
        </div>
      )}
      {message && (
        <div className="mb-4 p-4 bg-yellow-600 text-white rounded-md shadow-md">
          {message}
        </div>
      )}
      {currentGoal && (
        <div className="p-6 border border-gray-400 shadow-md rounded-xl bg-gray-900 opacity-70 mb-6">
          <p className="text-xl font-semibold mb-2">🎯 Current Goal</p>
          <p className="mb-1">
            {" "}
            Daily Commit Goals: {currentGoal.dailyCommitGoal}
          </p>
          <p className="mb-4"> Weekly PR Goals: {currentGoal.weeklyPRGoal}</p>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded-lg text-sm font-semibold cursor-pointer "
          >
            Delete Goal
          </button>
        </div>
      )}
      {!currentGoal && (
        <div>
          <p className="text-xl font-semibold mb-2">Add New Goal</p>
          <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
           <div>
  <label className='block font-semibold text-teal-300 mb-2'> Daily Commit Goals</label>
            <input
              type="number"
              value={dailyCommitGoal}
              onChange={(e) => {
                setDailyCommitGoal(e.target.value);
              }} className='bg-gray-900 border border-teal-700 p-2  rounded text-white '
            />
           </div>
          <div>
      <label className='block font-semibold text-teal-300 mb-2'> Weekly PR Goals </label>
            <input
              type="number"
              value={weeklyPRGoal}
              onChange={(e) => {
                setWeeklyPRGoal(e.target.value);

              }} className='bg-gray-900 border border-teal-700 p-2  rounded text-white '
            />
          </div>
      
            <button type="submit" className='bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition'>Submit</button>
          </form>
        </div>
      )}

     <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 mt-8">
  <h2 className="text-2xl font-semibold mb-4 text-white">📚 Goal History</h2>

  {goalHistory.length > 0 ? (
    <div className="space-y-4">
      {goalHistory.map((goal, index) => (
        <div
          key={index}
          className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-sm transition-all duration-300 hover:scale-[1.01]"
        >
          <p className="text-sm text-gray-400 mb-2">
            🕒 Date:{" "}
            <span className="text-white">
              {new Date(goal.updatedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </p>
          <p className="text-white mb-1">📌 Daily Commit Goal: <span className="font-medium">{goal.dailyCommitGoal}</span></p>
          <p className="text-white">🔁 Weekly PR Goal: <span className="font-medium">{goal.weeklyPRGoal}</span></p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-400">No goal history available yet.</p>
  )}
</div>

    </div>
  );

}
export default Goals
