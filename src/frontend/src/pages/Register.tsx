import { useState } from "react";
import { Link, useNavigate } from "../lib/router";
import { storage } from "../lib/storage";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    confirm: "",
    secretKey: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const adminExists = !!storage.getAdmin();
  const secretKeyExists = !!storage.getAdminSecretKey();
  const isFirstTime = !adminExists || !secretKeyExists;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isFirstTime) {
      if (form.secretKey !== storage.getAdminSecretKey()) {
        setError("Incorrect admin secret key. Access denied.");
        return;
      }
    } else {
      if (!form.secretKey.trim()) {
        setError("You must set a secret key to protect future registrations.");
        return;
      }
    }

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
    if (isFirstTime) {
      storage.setAdminSecretKey(form.secretKey.trim());
    }
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
            {isFirstTime
              ? "Admin Setup - First Time Registration"
              : "Reset Admin Account"}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-gray-800 font-bold text-xl mb-1">
            {isFirstTime ? "Create Admin Account" : "Reset Admin Account"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isFirstTime
              ? "Set up the administrator account and create a secret key to protect future registrations."
              : "Enter the admin secret key to verify your identity before resetting."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { field: "name", label: "Full Name", type: "text" },
              { field: "username", label: "Username", type: "text" },
              { field: "password", label: "Password", type: "password" },
              { field: "confirm", label: "Confirm Password", type: "password" },
            ].map(({ field, label, type }) => (
              <div key={field}>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </div>
                <input
                  type={type}
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

            <div className="border-t border-gray-100 pt-4">
              <div className="block text-sm font-medium text-gray-700 mb-1">
                {isFirstTime ? "Set Admin Secret Key" : "Admin Secret Key"}
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {isFirstTime
                  ? "This key will be required to register as admin in the future. Keep it confidential."
                  : "Enter the secret key to confirm you are authorized to reset this account."}
              </p>
              <input
                type="text"
                value={form.secretKey}
                onChange={(e) =>
                  setForm({ ...form, secretKey: e.target.value })
                }
                data-ocid="register.secretKey.input"
                placeholder={
                  isFirstTime ? "Create a secret key" : "Enter the secret key"
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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
              {isFirstTime ? "Create Admin Account" : "Reset Admin Account"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
