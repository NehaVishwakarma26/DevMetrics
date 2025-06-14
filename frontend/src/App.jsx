import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import DashboardLayout from "./Components/DashboardLayout";
import Dashboard from "./Pages/Dashboard";
import Goals from "./Pages/Goals";
import Stats from "./Pages/Stats/Stats";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./Pages/Home/Home";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes start here */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="goals" element={<Goals />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
