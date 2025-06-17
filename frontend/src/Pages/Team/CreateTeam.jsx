import React from 'react'
import { useState } from 'react'

const CreateTeam = () => {

    const [teamName,setTeamName]=useState("")
    const [usernames,setUsernames]=useState([])
    const [loading,setLoading]=useState(false)

    


  return (
    <div>
      <h2>Create a New Team</h2>
      <div>
        <label>Team Name:</label>
        <input type="text" value={teamName} onChange={(e)=>setTeamName(e.target.value)}/>
        <div>
          <label>Add Members</label>
          {
            usernames.map((username,index)=>(
              <div key={index}>

<input type="text" value={username} onChange={(e)=>handleUsernameChange(index)}

                </div>
            ))
          }
        </div>
      </div>

    </div>
  )
}

export default CreateTeam
