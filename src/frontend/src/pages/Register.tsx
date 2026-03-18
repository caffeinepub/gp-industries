import { useState } from "react";
import { useNavigate } from "../lib/router";
import { storage } from "../lib/storage";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (storage.getAdmin()) {
    navigate("/login");
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    storage.setAdmin({
      name: form.name,
      username: form.username,
      password: form.password,
    });
    navigate("/login");
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
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #2F6FEA, #18B6B2)" }}
          >
            <span className="text-white font-bold text-xl">GP</span>
          </div>
          <h1 className="text-white text-2xl font-bold">GP INDUSTRIES</h1>
          <p className="text-blue-300 text-sm mt-1">
            Admin Setup - First Time Registration
          </p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-gray-800 font-bold text-xl mb-1">
            Create Admin Account
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Set up the administrator account to manage GP Industries
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {["name", "username", "password", "confirm"].map((field) => (
              <div key={field}>
                <div className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field === "confirm"
                    ? "Confirm Password"
                    : field === "name"
                      ? "Full Name"
                      : field.charAt(0).toUpperCase() + field.slice(1)}
                </div>
                <input
                  type={
                    field === "password" || field === "confirm"
                      ? "password"
                      : "text"
                  }
                  value={form[field as keyof typeof form]}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                  data-ocid={`register.${field}.input`}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
            {error && (
              <p
                className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg"
                data-ocid="register.error_state"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              data-ocid="register.submit_button"
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #2F6FEA, #18B6B2)",
              }}
            >
              Create Admin Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
