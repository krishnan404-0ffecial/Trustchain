import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import PrivateRoute from "./components/PrivateRoute";

import UserDashboard from "./modules/user/UserDashboard";
import MyBookings from "./modules/user/MyBookings";

import WorkerDashboard from "./modules/worker/WorkerDashboard";
import KYCUpload from "./modules/worker/KYCUpload";
import MyJobs from "./modules/worker/MyJobs";

import AdminDashboard from "./modules/admin/AdminDashboard";
import VerifyKYC from "./modules/admin/VerifyKYC";
import ManageUsers from "./modules/admin/ManageUsers";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/user/dashboard"
          element={
            <PrivateRoute roles={["user"]}>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/jobs"
          element={
            <PrivateRoute roles={["user"]}>
              <MyBookings />
            </PrivateRoute>
          }
        />

        <Route
          path="/worker/dashboard"
          element={
            <PrivateRoute roles={["worker"]}>
              <WorkerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/worker/kyc"
          element={
            <PrivateRoute roles={["worker"]}>
              <KYCUpload />
            </PrivateRoute>
          }
        />
        <Route
          path="/worker/jobs"
          element={
            <PrivateRoute roles={["worker"]}>
              <MyJobs />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/kyc"
          element={
            <PrivateRoute roles={["admin"]}>
              <VerifyKYC />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute roles={["admin"]}>
              <ManageUsers />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute roles={["user", "worker", "admin"]}>
              <Chat />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
