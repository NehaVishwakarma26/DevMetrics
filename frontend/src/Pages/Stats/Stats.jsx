import React from 'react'
import CommitsBarChart from './Components/CommitsBarChart'
import {trackCommits} from "../../services/api"
import { useState,useEffect } from 'react'
const Stats = () => {
const [commits,setCommits]=useState([])
const [lastSevenDaysCommits,setLastSevenDaysCommits]=useState([])


useEffect(()=>{
fetchData()
},[])

//runs whenever commits is updated
useEffect(()=>{
  lastSevenDays()
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


  return (
    <div>
      <CommitsBarChart commitCounts={lastSevenDaysCommits}/>
    </div>
  )
}

export default Stats
