import React,{useState,useEffect} from 'react'
import {updateTeamName,updateRepo,getGithubRepos,inviteMember,removeMember,deleteTeam,getTeamData,searchUsersByUsername} from "../../../services/api"
import {useAuth} from "../../../context/AuthContext"

const AdminControls = ({teamId,teamName,repo,refetchTeam}) => {
const {user}=useAuth()
  const [newName,setNewName]=useState('')
  const [newRepo,setNewRepo]=useState('')
  const [usernameToRemove,setUsernameToRemove]=useState('')
  const [feedback,setFeedback]=useState('')
  const [repos,setRepos]=useState([])
  const [teamData,setTeamData]=useState(null)
  const [usernameToInvite,setUsernameToInvite]=useState('')
  const [members,setMembers]=useState([])
  const [searchResults,setSearchResults]=useState([])
  const [searchQuery,setSearchQuery]=useState('')

useEffect(()=>{

const fetchRepos=async()=>{
  try{
    const res=await getGithubRepos()
    setRepos(res.data || [])
  }
  catch(err)
  {
    setFeedback("Failed to load repos")
    console.error(err)
  }
}

const fetchTeamData=async()=>{
  try{
    const res=await getTeamData(teamId)
    setTeamData(res.data || null)
    console.log("team data",res.data)

    setMembers(res.data.team.members || null)
    console.log("team members",res.data.team.members)
  }
  catch(err)
  {
    setFeedback("Failed to load team data")
    console.error(err)
  }
}

fetchRepos()
fetchTeamData()

},[])


const handleUpdateName=async ()=>{
  //send name in the body of the request
try{


  const data={
    name:newName
  }
  const response =await updateTeamName(teamId,data)
  if(response.status===200)
  {
    setFeedback("Team name updated successfully")
  }
  refetchTeam()
  setNewName('')
}
catch(err)
{
  setFeedback(err.message)
}
}


  const handleUpdateRepo = async () => {
    try {
      const response = await updateRepo(teamId, { repo: newRepo });
      if (response.status === 200) {
        setFeedback("Repository updated successfully");
        setNewRepo('');
        refetchTeam();
      }
    } catch (err) {
      setFeedback(err.message);
    }
  };

  const handleInviteMember = async () => {
  try {
    const response = await inviteMember(teamId, { username: usernameToInvite });
    if (response.status === 200) {
      setFeedback("Member invited successfully");
      setUsernameToInvite('');
      refetchTeam();
      setSearchQuery('')
    }
  } catch (err) {
    setFeedback(err.response?.data?.message || err.message);
  }
};

const handleRemoveMember = async () => {
  try {
    const response = await removeMember(teamId, { username: usernameToRemove });
    if (response.status === 200) {
      setFeedback("Member removed successfully");
      setUsernameToRemove('');
      refetchTeam();
    }
  } catch (err) {
    setFeedback(err.response?.data?.message || err.message);
  }
};

const handleDeleteTeam = async () => {
  try {
    const response = await deleteTeam(teamId);
    if (response.status === 200) {
      setFeedback("Team deleted");
      setTimeout(() => {
        window.location.href = '/dashboard'; // or your main page
      }, 1000);
    }
  } catch (err) {
    setFeedback(err.response?.data?.message || err.message);
  }
};

const handleSearchUsers = async (e) => {
  const query = e.target.value;
  setSearchQuery(query);

  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    const res = await searchUsersByUsername(query.trim());
    const results = res.data.users || [];

    // Filter out users already in team
    const filtered = results.filter(
      (user) => !members.some((member) => member.username === user.username)
    );

    setSearchResults(filtered);
  } catch (err) {
    console.error(err);
    setFeedback("Failed to search users");
  }
};


  return (
    <div className="p-5">
      {feedback && (
        <div className="bg-gray-300 text-gray-900 p-3 my-3 rounded-lg text-center">
          {feedback}
        </div>
      )}
      <div>
        <input
          type="text"
          placeholder="New Team Name"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
          }}
          className="w-full border-2 border-gray-300 focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded-lg p-2 "
        />
        <button
          type="button"
          onClick={handleUpdateName}
          className="mt-2 rounded-lg text-gray-100 p-2  bg-purple-800 hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
        >
          Update Name
        </button>
      </div>

      <div>
        <select
          value={newRepo}
          onChange={(e) => {
            setNewRepo(e.target.value);
          }}
          className=" mt-8 rounded-lg text-gray-400 p-2 w-full border-2 border-gray-300 focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          <option value="" className="text-gray-500 ">
            Select Repository
          </option>
          {repos.map((r) => (
            <option key={r.id} value={r.name} className="text-gray-900 ">
              {r.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleUpdateRepo}
          className="mt-2 rounded-lg text-gray-100 p-2  bg-purple-800 hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
        >
          Update Repository Name
        </button>
      </div>

      <div className="mt-8">
        <input
          type="text"
          placeholder="Search user to invite"
          value={searchQuery}
          onChange={handleSearchUsers}
          className="w-full p-2 border rounded-lg mb-2"
        />

        {searchQuery && (
          <ul className="bg-gray-800 text-white rounded-lg p-2">
            {searchResults.map((user) => (
              <li
                key={user._id}
                className="cursor-pointer hover:bg-gray-700 p-2 rounded"
                onClick={() => {
                  setUsernameToInvite(user.username);
                  setSearchResults([]);
                  setSearchQuery(user.username);
                }}
              >
                {user.username}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleInviteMember}
          className="mt-2 bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer"
          disabled={!usernameToInvite}
        >
          Invite Member
        </button>
      </div>

      <div className="mt-8">
        <select
          value={usernameToRemove}
          onChange={(e) => setUsernameToRemove(e.target.value)}
          className="w-full p-2 border mt-4 border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select a user to remove</option>
          {members &&
            members
              .filter((member) => member._id !== user._id)
              .map((member) => (
                <option
                  key={member._id}
                  value={member.username}
                  className="text-gray-900"
                >
                  {member.username}
                </option>
              ))}
        </select>
        <button
          onClick={handleRemoveMember}
          className="mt-2 bg-red-800 text-white px-4 py-2 rounded-lg cursor-pointer"
          disabled={!usernameToRemove}
        >
          Remove Member
        </button>
      </div>

      {/* Delete Team */}
      <div className="mt-8 flex justify-center items-center">
        <button
          onClick={handleDeleteTeam}
          className="bg-red-800 text-white px-6 py-2 rounded-xl text-xl cursor-pointer hover:bg-red-600 "
        >
          Delete Team
        </button>
      </div>
    </div>
  );
}

export default AdminControls
