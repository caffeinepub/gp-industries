import { BrowserRouter, Navigate, Route, Routes } from "./lib/router";
import { storage } from "./lib/storage";
import Analysis from "./pages/Analysis";
import Attendance from "./pages/Attendance";
import Contracts from "./pages/Contracts";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Login from "./pages/Login";
import ProfitLoss from "./pages/ProfitLoss";
import Register from "./pages/Register";
import Salary from "./pages/Salary";

function Protected({ children }: { children: React.ReactNode }) {
  const user = storage.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/employees"
          element={
            <Protected>
              <Employees />
            </Protected>
          }
        />
        <Route
          path="/attendance"
          element={
            <Protected>
              <Attendance />
            </Protected>
          }
        />
        <Route
          path="/salary"
          element={
            <Protected>
              <Salary />
            </Protected>
          }
        />
        <Route
          path="/contracts"
          element={
            <Protected>
              <Contracts />
            </Protected>
          }
        />
        <Route
          path="/profit-loss"
          element={
            <Protected>
              <ProfitLoss />
            </Protected>
          }
        />
        <Route
          path="/analysis"
          element={
            <Protected>
              <Analysis />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
