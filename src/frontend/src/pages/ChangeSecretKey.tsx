import { KeyRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "../lib/router";
import { storage } from "../lib/storage";

export default function ChangeSecretKey() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();

  const [step, setStep] = useState<"verify" | "change">("verify");
  const [currentKey, setCurrentKey] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newHint, setNewHint] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Only admin can access this
  if (!user || user.role !== "admin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #0B1F33 0%, #0A2B4A 60%, #0d3561 100%)",
        }}
      >
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full mx-4">
          <p className="text-red-500 font-semibold">
            Access denied. Admin only.
          </p>
          <Link
            to="/dashboard"
            className="mt-4 inline-block text-blue-600 text-sm hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const storedKey = storage.getAdminSecretKey();
    // If no secret key is set, allow through directly
    if (!storedKey) {
      setError("");
      setStep("change");
      return;
    }
    if (currentKey === storedKey) {
      setError("");
      setStep("change");
    } else {
      setError("Incorrect secret key. Please try again.");
    }
    setCurrentKey("");
  }

  function handleChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey.trim()) {
      setError("New secret key cannot be empty.");
      return;
    }
    storage.setAdminSecretKey(newKey.trim());
    if (newHint.trim()) {
      storage.setSecretKeyHint(newHint.trim());
    } else {
      localStorage.removeItem("gpSecretKeyHint");
    }
    setSuccess(true);
    setError("");
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
            <KeyRound size={28} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">GP INDUSTRIES</h1>
          <p className="text-blue-300 text-sm mt-1">Change Admin Secret Key</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "#e6f9f0" }}
              >
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h2 className="text-gray-800 font-bold text-xl mb-2">
                Secret Key Updated
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Your new secret key is now active. Keep it safe!
              </p>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm"
                style={{
                  background: "linear-gradient(135deg, #2F6FEA, #18B6B2)",
                }}
              >
                Back to Dashboard
              </button>
            </div>
          ) : step === "verify" ? (
            <>
              <h2 className="text-gray-800 font-bold text-xl mb-1">
                Verify Identity
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Enter your current secret key to continue. You can change it as
                many times as needed.
              </p>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-1">
                    Current Secret Key
                  </div>
                  <input
                    type="text"
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    placeholder="Enter your current secret key"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-white font-semibold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #2F6FEA, #18B6B2)",
                  }}
                >
                  Verify Key
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-gray-800 font-bold text-xl mb-1">
                Set New Secret Key
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Choose a new secret key. You can also update the hint shown on
                the login page.
              </p>
              <form onSubmit={handleChange} className="space-y-4">
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-1">
                    New Secret Key
                  </div>
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter your new secret key"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-1">
                    New Hint{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    placeholder="A hint to remind you -- without revealing the key"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-white font-semibold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #2F6FEA, #18B6B2)",
                  }}
                >
                  Update Secret Key
                </button>
              </form>
            </>
          )}

          {!success && (
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link
                to="/dashboard"
                className="text-blue-600 font-medium hover:underline"
              >
                Cancel
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
