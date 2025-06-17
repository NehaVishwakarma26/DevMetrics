import React from 'react'
import { useState } from 'react'
import {searchUsersByUsername,createTeam} from "../../services/api"
import {useAuth} from "../../context/AuthContext"
const CreateTeam = () => {
const {user}=useAuth()
const [teamName,setTeamName]=useState("")
const [usernameInput,setUsernameInput]=useState("")
const [suggestions,setSuggestions]=useState([])
const [selectedmembers,setSelectedMembers]=useState([])
const [loading,setLoading]=useState(false)

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
  const res=await createTeam({name:teamName,owner:user._id,members:finalMembers})
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

  return (
    <div>
      <h2>Create Team</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Team Name:</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />

          <div>
            <label>Add Members</label>
            <input type="text" value={usernameInput} onChange={(e)=>{
              setUsernameInput(e.target.value)
              fetchSuggestions(e.target.value)
            }}
            placeholder='Search By Username'/>
          
          </div>
          {suggestions.length>0 && (
            <ul>
              {suggestions.map((user)=>(
                <li key={user.username}
                onClick={()=>handleAddMember(user.username)}>
                  {user.username}
                </li>
              ))}
            </ul>
          )}

        </div>
        <div>
          {selectedmembers.map((username)=>(
            <span key={username}>{username}
            <button type='button' onClick={()=>handleRemoveMember(username)}>Remove</button>
            </span>
          ))}
        </div>

<button disabled={loading} type="submit" >{loading?"Creating Team...":"Create Team" } </button>


      </form>
    </div>
  );
}

export default CreateTeam
