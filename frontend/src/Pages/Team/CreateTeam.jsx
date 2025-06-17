import React from 'react'
import { useState ,useEffect} from 'react'
import {searchUsersByUsername,createTeam,getGithubRepos} from "../../services/api"
import {useAuth} from "../../context/AuthContext"
const CreateTeam = () => {
const {user}=useAuth()
const [teamName,setTeamName]=useState("")
const [usernameInput,setUsernameInput]=useState("")
const [suggestions,setSuggestions]=useState([])
const [selectedmembers,setSelectedMembers]=useState([])
const [loading,setLoading]=useState(false)
const [repoInput,setRepoInput]=useState("")
const [repoSuggestions,setRepoSuggestions]=useState([])
const [selectedRepo,setSelectedRepo]=useState("")

const fetchSuggestions=async (query)=>{
  
  if(!query)
    return setSuggestions([])

  try{
  const response=await searchUsersByUsername(query)
  setSuggestions(response.data.users)
  }
  catch(Err)
  {
    console.error("Error fetching suggestions")
  }

}

const handleAddMember=(username)=>{
  if(!selectedmembers.includes(username))
  {
    setSelectedMembers([...selectedmembers,username])
  }
  setUsernameInput("");
  setSuggestions([])
}

const handleRemoveMember=(username)=>{
  setSelectedMembers(selectedmembers.filter((u)=>u!==username))
}

const handleSubmit=async(e)=>{
  e.preventDefault()

try{
  setLoading(true)
  const finalMembers=[...selectedmembers,user.username]
  const res=await createTeam({name:teamName,memberUsernames:finalMembers,repo:selectedRepo})
  console.log(res)
  alert("Team Created Successfully")
  setTeamName("")
  setSelectedMembers([])

}
catch(err){
console.error(err.message)
alert(err.message)
}
finally{
  setLoading(false)
}

}

useEffect(()=>{
const fetchRepos=async ()=>{
  try{
    const res=await getGithubRepos();
    setRepoSuggestions(res.data)
  }
  catch(err)
  {
    console.error("Failed to fetch repos",err.message)
  }
}

fetchRepos()
},[])

  return (
    <div className='p-6 bg-gray-900 text-gray-100 rounded-xl shadow-lg'>
      <h2 className='text-2xl font-bold mb-4 text-purple-400'>Create Team</h2>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label className='block mb-1'>Team Name:</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className='w-full p-2 rounded bg-gray-800 border-gray-700 focus:outline-none focus:border-purple-500'
          />

          <div>
            <label className='block mb-1'>Add Members</label>
            <input type="text" value={usernameInput} onChange={(e)=>{
              setUsernameInput(e.target.value)
              fetchSuggestions(e.target.value)
            }}
            placeholder='Search By Username'
            className='w-full p-2 rounded bg-gray-800 border-gray-700 focus:outline-none focus:border-purple-500'
            />
          
          </div>
          {suggestions.length>0 && (
            <ul className='bg-gray-800 mt-2 rounded shadow text-sm'>
              {suggestions.map((user)=>(
                <li key={user.username}
                onClick={()=>handleAddMember(user.username)}
                className='px-3 py-2 cursor-pointer hover:bg-teal-600'
                >
                  {user.username}
                  
                </li>
              ))}
            </ul>
          )}

        </div>
        <div className='flex flex-wrap gap-2'>
          {selectedmembers.map((username)=>(
            <span key={username}
            className='bg-purple-600 px-3 py-3 rounded-full text-sm flex items-center gap-2'
            >{username}
            <button type='button' onClick={()=>handleRemoveMember(username)}
              className='text-xs text-white bg-red-500 hover:bg-red-600 px-2 rounded'
              >X</button>
            </span>
          ))}
        </div>

        <div>
          <label>Add Repo</label>
     <select value={selectedRepo} onChange={(e)=>setSelectedRepo(e.target.value)}>
      <option value="">Select Team Repository</option>
      {
        repoSuggestions.map((repo)=>(
          <option key={repo.id} value={repo.full_name}>
            {repo.full_name}
          </option>
        ))
      }
     </select>
        </div>

<button disabled={loading} type="submit"       className={`w-full py-2 rounded text-white font-semibold ${
          loading
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-teal-500 transition duration-200'
        }`}>{loading?"Creating Team...":"Create Team" } </button>


      </form>
    </div>
  );
}

export default CreateTeam
