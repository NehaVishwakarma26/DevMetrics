// src/AllRoutes.jsx

import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import DashboardLayout from "./Components/DashboardLayout";
import Dashboard from "./Pages/Dashboard";
import Goals from "./Pages/Goals";
import Stats from "./Pages/Stats/Stats";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./Pages/Home/Home";
import CreateTeam from "./Pages/Team/CreateTeam";
import MyTeam from "./Pages/Team/MyTeam";
import TeamDashboard from "./Pages/Team/TeamDashboard"; // add if using team-specific dashboard
import TeamChatPage from "./Pages/Team/DashboardComponents/TeamChatbox";
const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="goals" element={<Goals />} />
          <Route path="stats" element={<Stats />} />
          <Route path="createTeam" element={<CreateTeam />} />
          <Route path="myTeam" element={<MyTeam />} />
        <Route path="team/:teamId" element={<TeamDashboard />} />

        </Route>
<Route path="/team/:teamId/chat" element={<TeamChatPage />} />
        {/* Team dashboard (not nested in sidebar layout) */}
      </Route>
    </Routes>
  );
};

export default AllRoutes;
