import React from 'react'
import {useEffect,useState} from "react"
import {getUserTeams} from "../../services/api"
import { Link, NavLink } from 'react-router-dom'
const MyTeam = () => {

const [teams,setTeams]=useState([])
const [loading,setLoading]=useState(false)


useEffect(()=>{
const fetchTeams=async()=>{
    setLoading(true)
    try{
const res=await getUserTeams()
console.log(res.data.teams)
setTeams(res.data.teams)
    }
    catch(err)
    {
        console.error("Failed to fetch teams",err)
    }
    finally{
        setLoading(false)
    }
}
fetchTeams();
},[])


 if (loading) return <p className='text-gray-300'>Loading your teams...</p>;
  if (!teams.length) return <p className='text-gray-400'>You haven't joined any teams yet.</p>;

  return (
    <div className='p-6 bg-gray-900 text-gray-100 rounded-xl shadow-lg'>
      <h2 className='text-2xl font-bold mb-4 text-purple-400'>My Teams</h2>
    
      <div className='space-y-4'>
        {teams.map((team) => (
            <NavLink to={`/dashboard/team/${team._id}`} key={team._id}>
<div  className='p-4 bg-gray-800 rounded-lg border border-purple-600'>
            <h3 className='text-lg font-semibold text-teal-400'>{team.name}</h3>
            <p className='text-sm text-gray-300'>Repo: {team.repo || "N/A"}</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {team.members.map((m) => (
                <span key={m} className='bg-purple-700 px-3 py-1 rounded-full text-sm'>
                  {m.username}
                </span>
              ))}
            </div>
          </div>
            </NavLink>
          
        ))}
      </div>
    </div>
  )
}

export default MyTeam
