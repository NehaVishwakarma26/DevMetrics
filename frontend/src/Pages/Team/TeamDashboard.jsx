import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import TeamOverview from './DashboardComponents/TeamOverview';
import TeamMemberPanel from './DashboardComponents/TeamMemberPanel';
import TeamActivityInsights from './DashboardComponents/TeamActivityInsights';
import TeamHeatMap from './DashboardComponents/TeamHeatMap';
import AdminControls from './DashboardComponents/AdminControls';
import SprintSummary from './DashboardComponents/SprintSummary';
import {getTeamData} from "../../services/api"

const TeamDashboard = () => {
  const { user } = useAuth();
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [fetchedUserId, setFetchedUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await getTeamData(teamId)
        console.log(response.data);
        setTeam(response.data.team);
        const fetchedId = response.data.currentUserId;
        console.log("fetched id", fetchedId);
        console.log("user id", user._id);
        setFetchedUserId(fetchedId);

        if (fetchedId === response.data.team.owner?._id) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchTeamData();
  }, [teamId, user._id]);

  if (!team) return <p className='text-gray-400'>Loading team data...</p>;

  return (
    <div>
      {/* Admin Edit Button */}
     

      {/* Team Sections */}
      <TeamOverview
        teamName={team.name}
        createdBy={team.owner.username}
        members={team.members}
        currentUser={user.username}
        isAdmin={isAdmin}
      />

{showAdminModal && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-xl text-white relative">
      <button
        className="absolute top-3 right-4 text-xl"
        onClick={() => setShowAdminModal(false)}
      >
        ❌
      </button>
      <AdminControls
        teamId={team._id}
        teamName={team.name}
        repo={team.repo}
        refetchTeam={() => window.location.reload()}
      />
    </div>
  </div>
)}


      <TeamMemberPanel
        members={team.members}
        createdById={team.owner._id}
        loggedInUserId={user._id}
        isAdmin={isAdmin}
        onEditClick={()=>setShowAdminModal(true)}
      />

<SprintSummary teamId={team._id} repo={team.repo}

/>
   
      
      <TeamActivityInsights teamId={team._id} repo={team.repo} />
      <TeamHeatMap teamId={team._id} teamName={team.name} repo={team.repo} />


     
      <Link
  to={`/team/${team._id}/chat`}
  className="fixed bottom-15 right-6 bg-teal-700 hover:bg-teal-800 text-white px-5 py-3 rounded-full shadow-lg z-[999]"
>
  💬 Chat
</Link>

    </div>
  

);
};

export default TeamDashboard;
