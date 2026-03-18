import { Building2, Lock, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "../lib/router";
import { storage } from "../lib/storage";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const secretKeyHint = storage.getSecretKeyHint();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const admin = storage.getAdmin();
    if (admin && admin.username === username && admin.password === password) {
      storage.setCurrentUser({ username, role: "admin", name: admin.name });
      navigate("/dashboard");
      return;
    }
    const emps = storage.getEmployees();
    const emp = emps.find(
      (e) =>
        (e.username === username || e.empId === username) &&
        e.password === password,
    );
    if (emp) {
      storage.setCurrentUser({
        username: emp.username,
        role: "employee",
        name: emp.name,
        empId: emp.empId,
      });
      navigate("/dashboard");
      return;
    }
    setError("Invalid credentials. Please try again.");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #0B1F33 0%, #0A2B4A 60%, #0d3561 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #2F6FEA, #18B6B2)" }}
          >
            <span className="text-white font-bold text-xl">GP</span>
          </div>
          <h1 className="text-white text-2xl font-bold">GP INDUSTRIES</h1>
          <p className="text-blue-300 text-sm mt-1">
            Business Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-gray-800 font-bold text-xl mb-1">Welcome Back</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign in with your Employee ID or Admin credentials
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">
                Username / Employee ID
              </div>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-ocid="login.username.input"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username or employee ID"
                  required
                />
              </div>
            </div>
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-ocid="login.password.input"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            {error && (
              <p
                className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg"
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              data-ocid="login.submit_button"
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #2F6FEA, #18B6B2)",
              }}
            >
              Sign In
            </button>
          </form>

          {secretKeyHint && (
            <div className="mt-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-600">
                <span className="font-semibold">Secret Key Hint:</span>{" "}
                {secretKeyHint}
              </p>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            Admin?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Register / Reset Admin
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-400 text-xs">
            <Building2 size={12} />
            GP Industries Management System
          </div>
        </div>
      </div>
    </div>
  );
}
