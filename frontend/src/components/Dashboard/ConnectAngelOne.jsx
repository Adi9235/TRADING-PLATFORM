import React, { useState } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle } from "lucide-react";

const ConnectAngelOne = () => {
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "/api/angelone/connect",
        { clientId, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(
        error.response?.data?.message || "Connection failed. Please try again."
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Connect Angel One Account</h2>
        <img
          src="/api/placeholder/100/40"
          alt="Angel One Logo"
          className="h-8"
        />
      </div>

      {success ? (
        <div className="bg-green-50 p-4 rounded-md mb-6">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-green-800 font-medium">
                Connection Successful!
              </h3>
              <p className="text-green-700 text-sm mt-1">
                Your Angel One account has been successfully connected. You can
                now start trading.
              </p>
              <button
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                onClick={() => window.location.reload()}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConnect}>
          {error && (
            <div className="bg-red-50 p-4 rounded-md mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="clientId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Angel One Client ID
              </label>
              <input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Angel One Client ID"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Angel One password"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Your credentials are securely used to establish a connection and
                are not stored.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded text-white font-medium ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Connecting..." : "Connect Account"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Why connect your Angel One account?
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Trade directly from our platform</li>
          <li>• View your portfolio and positions in one place</li>
          <li>• Access advanced analytics and insights</li>
          <li>• Set up automated trading strategies</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectAngelOne;
