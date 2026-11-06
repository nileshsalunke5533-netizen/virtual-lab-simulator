import { Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./context/AuthContext";
import { AttemptProvider } from "./context/AttemptContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Menu from "./components/Menu";

import Profile from "./pages/Profile";
import Result from "./pages/Result";
import DTMResult from "./pages/DTMResult";
import DCNResult from "./pages/DCNResult";

import FacultyDashboard from "./pages/admin/FacultyDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import ExperimentManagement from "./pages/admin/ExperimentManagement";
import ResultProgress from "./pages/admin/ResultProgress";

import Attendance from "./pages/admin/Attendance";

import ProtectedExperiment from "./components/ProtectedExperiment.jsx";

// Experiment Lists
import DTMExperimentList from "./pages/DTMExperimentList";
import DCNExperimentList from "./pages/DCNExperimentList";
import IFSExperimentList from "./pages/IFSExperimentList";
import DSTExperimentList from "./pages/DSTExperimentList";

// DTM Experiments
import DTMExperiment1 from "./experiments/dtm/DTMExperiment1/DTMExperiment1";
import DTMExperiment2 from "./experiments/dtm/DTMExperiment2/DTMExperiment2";
import DTMExperiment3 from "./experiments/dtm/DTMExperiment3/DTMExperiment3";
import DTMExperiment4 from "./experiments/dtm/DTMExperiment4/DTMExperiment4";
import DTMExperiment5 from "./experiments/dtm/DTMExperiment5/DTMExperiment5";
import DTMExperiment6 from "./experiments/dtm/DTMExperiment6/DTMExperiment6";
import DTMExperiment7 from "./experiments/dtm/DTMExperiment7/DTMExperiment7";
import DTMExperiment8 from "./experiments/dtm/DTMExperiment8/DTMExperiment8";
import DTMExperiment9 from "./experiments/dtm/DTMExperiment9/DTMExperiment9";

// DCN Experiments
import DCNExperiment1 from "./experiments/dcn/DCNExperiment1/DCNExperiment1";
import DCNExperiment3 from "./experiments/dcn/DCNExperiment3/DCNExperiment3";
import DCNExperiment4 from "./experiments/dcn/DCNExperiment4/DCNExperiment4";
import DCNExperiment5 from "./experiments/dcn/DCNExperiment5/DCNExperiment5";
import DCNExperiment6 from "./experiments/dcn/DCNExperiment6/DCNExperiment6";
import DCNExperiment7 from "./experiments/dcn/DCNExperiment7/DCNExperiment7";
import DCNExperiment8 from "./experiments/dcn/DCNExperiment8/DCNExperiment8";
import DCNExperiment9 from "./experiments/dcn/DCNExperiment9/DCNExperiment9";
import DCNExperiment10 from "./experiments/dcn/DCNExperiment10/DCNExperiment10";
import DCNExperiment2 from "./experiments/dcn/DCNExperiment2/DCNExperiment2";


// IFS Experiments
import IFSExperiment9 from "./experiments/ifs/IFSExperiment9/IFSExperiment9";
import IFSExperiment6 from "./experiments/ifs/IFSExperiment6/IFSExperiment6";
import IFSExperiment7 from "./experiments/ifs/IFSExperiment7/IFSExperiment7";
 import IFSExperiment8 from "./experiments/ifs/IFSExperiment8/IFSExperiment8";
 import IFSExperiment2 from "./experiments/ifs/IFSExperiment2/IFSExperiment2";
import IFSExperiment4 from "./experiments/ifs/IFSExperiment4/IFSExperiment4";
import IFSExperiment10 from "./experiments/ifs/IFSExperiment10/IFSExperiment10";
import IFSExperiment1 from "./experiments/ifs/IFSExperiment1/IFSExperiment1";
import IFSExperiment3 from "./experiments/ifs/IFSExperiment3/IFSExperiment3";
import IFSExperiment5 from "./experiments/ifs/IFSExperiment5/IFSExperiment5";




//DST expt
import DSTExperiment1 from "./experiments/dst/DSTExperiment1/DSTExperiment1";
import DSTExperiment3 from "./experiments/dst/DSTExperiment3/DSTExperiment3";
import DSTExperiment2 from "./experiments/dst/DSTExperiment2/DSTExperiment2";
import DSTExperiment4 from "./experiments/dst/DSTExperiment4/DSTExperiment4";
import DSTExperiment5 from "./experiments/dst/DSTExperiment5/DSTExperiment5";
import DSTExperiment10 from "./experiments/dst/DSTExperiment10/DSTExperiment10";
import DSTExperiment6 from "./experiments/dst/DSTExperiment6/DSTExperiment6";
import DSTExperiment7 from "./experiments/dst/DSTExperiment7/DSTExperiment7";
import DSTExperiment8 from "./experiments/dst/DSTExperiment8/DSTExperiment8";
import DSTExperiment9 from "./experiments/dst/DSTExperiment9/DSTExperiment9";
import DSTExperiment11 from "./experiments/dst/DSTExperiment11/DSTExperiment11";
import DSTExperiment12 from "./experiments/dst/DSTExperiment12/DSTExperiment12";












function App() {
  return (
    <AuthProvider>
      <AttemptProvider>
        <Routes>

      {/* Basic Pages */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<RequireAuth role="student"><Dashboard /></RequireAuth>} />
      <Route path="/menu" element={<RequireAuth role="student"><Menu /></RequireAuth>} />

      <Route path="/profile" element={<RequireAuth role="student"><Profile /></RequireAuth>} />
      <Route path="/result" element={<RequireAuth role="student"><Result /></RequireAuth>} />
      <Route
  path="/dtm-result"
  element={<RequireAuth role="student"><DTMResult /></RequireAuth>} />
      <Route
  path="/dcn-result"
  element={<RequireAuth role="student"><DCNResult /></RequireAuth>}
/>

      {/* Admin / Faculty */}
      <Route path="/faculty-dashboard" element={<RequireAuth role="faculty"><FacultyDashboard /></RequireAuth>} />
      <Route path="/student-management" element={<RequireAuth role="faculty"><StudentManagement /></RequireAuth>} />
      <Route path="/experiment-management" element={<RequireAuth role="faculty"><ExperimentManagement /></RequireAuth>} />
      <Route path="/result-progress" element={<RequireAuth role="faculty"><ResultProgress /></RequireAuth>} />

      <Route path="/attendance" element={<RequireAuth role="faculty"><Attendance /></RequireAuth>} />

      {/* Experiment Lists */}
      <Route path="/dtm-experiments" element={<RequireAuth role="student"><DTMExperimentList /></RequireAuth>} />
      <Route path="/dcn-experiments" element={<RequireAuth role="student"><DCNExperimentList /></RequireAuth>} />
      <Route path="/ifs-experiments" element={<RequireAuth role="student"><IFSExperimentList /></RequireAuth>} />
      <Route path="/dst-experiments" element={<RequireAuth role="student"><DSTExperimentList /></RequireAuth>} />

      {/* ================= DTM EXPERIMENTS ================= */}

      <Route path="/dtm-experiment-1" element={<RequireAuth role="student"><ProtectedExperiment subject="DTM" experimentId="1"><DTMExperiment1 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dtm-experiment-2" element={<RequireAuth role="student"><ProtectedExperiment subject="DTM" experimentId="2"><DTMExperiment2 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dtm-experiment-3" element={<RequireAuth role="student"><ProtectedExperiment subject="DTM" experimentId="3"><DTMExperiment3 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dtm-experiment-4" element={<RequireAuth role="student"><ProtectedExperiment subject="DTM" experimentId="4"><DTMExperiment4 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dtm-experiment-5" element={<RequireAuth role="student"><ProtectedExperiment subject="DTM" experimentId="5"><DTMExperiment5 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dtm-experiment-6" element={<RequireAuth role="student"><ProtectedExperiment subject="DTM" experimentId="6"><DTMExperiment6 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dtm-experiment-7" element={<RequireAuth role="student"><ProtectedExperiment subject="DTM" experimentId="7"><DTMExperiment7 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dtm-experiment-8" element={<RequireAuth role="student"><ProtectedExperiment subject="DTM" experimentId="8"><DTMExperiment8 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dtm-experiment-9" element={<RequireAuth role="student"><ProtectedExperiment subject="DTM" experimentId="9"><DTMExperiment9 /></ProtectedExperiment></RequireAuth>} />

      {/* ================= DCN EXPERIMENTS ================= */}

      <Route path="/dcn-experiment-1" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="1"><DCNExperiment1 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dcn-experiment-3" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="3"><DCNExperiment3 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dcn-experiment-4" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="4"><DCNExperiment4 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dcn-experiment-5" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="5"><DCNExperiment5 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dcn-experiment-6" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="6"><DCNExperiment6 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dcn-experiment-7" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="7"><DCNExperiment7 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dcn-experiment-8" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="8"><DCNExperiment8 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dcn-experiment-9" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="9"><DCNExperiment9 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dcn-experiment-10" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="10"><DCNExperiment10 /></ProtectedExperiment></RequireAuth>} />
      <Route path="/dcn-experiment-2" element={<RequireAuth role="student"><ProtectedExperiment subject="DCN" experimentId="2"><DCNExperiment2 /></ProtectedExperiment></RequireAuth>} />

      {/* ================= IFS EXPERIMENTS ================= */}

    <Route path="/ifs-experiment-2" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="2"><IFSExperiment2 /></ProtectedExperiment></RequireAuth>} />
    <Route path="/ifs-experiment-6" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="6"><IFSExperiment6 /></ProtectedExperiment></RequireAuth>} />
    <Route path="/ifs-experiment-7" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="7"><IFSExperiment7 /></ProtectedExperiment></RequireAuth>} />
    <Route path="/ifs-experiment-4" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="4"><IFSExperiment4 /></ProtectedExperiment></RequireAuth>} />
    <Route path="/ifs-experiment-10" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="10"><IFSExperiment10 /></ProtectedExperiment></RequireAuth>} />
    <Route path="/ifs-experiment-8" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="8"><IFSExperiment8 /></ProtectedExperiment></RequireAuth>} />
    <Route path="/ifs-experiment-9" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="9"><IFSExperiment9 /></ProtectedExperiment></RequireAuth>} />
    <Route path="/ifs-experiment-1" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="1"><IFSExperiment1 /></ProtectedExperiment></RequireAuth>} />
    <Route path="/ifs-experiment-3" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="3"><IFSExperiment3 /></ProtectedExperiment></RequireAuth>} />
    <Route path="/ifs-experiment-5" element={<RequireAuth role="student"><ProtectedExperiment subject="IFS" experimentId="5"><IFSExperiment5 /></ProtectedExperiment></RequireAuth>} />



<Route path="/dst-experiment-1" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="1"><DSTExperiment1 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-3" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="3"><DSTExperiment3 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-2" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="2"><DSTExperiment2 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-4" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="4"><DSTExperiment4 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-5" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="5"><DSTExperiment5 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-10" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="10"><DSTExperiment10 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-6" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="6"><DSTExperiment6 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-7" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="7"><DSTExperiment7 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-8" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="8"><DSTExperiment8 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-9" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="9"><DSTExperiment9 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-11" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="11"><DSTExperiment11 /></ProtectedExperiment></RequireAuth>} />
<Route path="/dst-experiment-12" element={<RequireAuth role="student"><ProtectedExperiment subject="DST" experimentId="12"><DSTExperiment12 /></ProtectedExperiment></RequireAuth>} />



        </Routes>
      </AttemptProvider>
    </AuthProvider>
  );
}

export default App;