import React, { useState, useEffect } from "react";

import { useParams } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import UserBrokerProfileComponent from "../../../components/Dashboard/UserBrokerProfileComponent";
import UserHoldings from "../../../components/Dashboard/UserHoldings";
import UserTradeBook from "../../../components/Dashboard/UserTradeBook";
import UserOrderBook from "../../../components/Dashboard/UserOrderBook";
import UserPositions from "../../../components/Dashboard/UserPositions";
import UserRMS from "../../../components/Dashboard/UserRMS";

const UserBrokerProfile = () => {
  const { brokerId, userId } = useParams();
  const [broker, setBroker] = useState();
  const [activeTab, setActiveTab] = useState("rms");
  const [loading, setLoading] = useState(true);

  console.log(userId);

  const fetchBroker = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/brokers/broker/${brokerId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setBroker(response?.data?.data);
    } catch (error) {
      console.error("Error fetching broker:", error);
      toast.error("Failed to load broker. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroker();
  }, [brokerId]);

  // Sample data - replace with API calls in production

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">
        {loading ? (
          <div className="animate-pulse">
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md mb-6 h-64"></div>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <UserBrokerProfileComponent
              brokerId={brokerId}
              broker={broker}
              userId={userId}
            />

            {/* Stats Cards */}
            <UserHoldings brokerId={brokerId} userId={userId} />

            {/* LTP Data Cards */}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    className={`px-6 py-3 border-b-2 font-medium text-sm ${
                      activeTab === "positions"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("positions")}
                  >
                    Positions
                  </button>
                  <button
                    className={`px-6 py-3 border-b-2 font-medium text-sm ${
                      activeTab === "orderbook"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("orderbook")}
                  >
                    Order Book
                  </button>
                  <button
                    className={`px-6 py-3 border-b-2 font-medium text-sm ${
                      activeTab === "tradebook"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("tradebook")}
                  >
                    Trade Book
                  </button>
                  <button
                    className={`px-6 py-3 border-b-2 font-medium text-sm ${
                      activeTab === "rms"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("rms")}
                  >
                    Risk Management System
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "rms" && (
                  <UserRMS brokerId={brokerId} userId={userId} />
                )}
                {activeTab === "positions" && (
                  <UserPositions brokerId={brokerId} userId={userId} />
                )}

                {activeTab === "tradebook" && (
                  <UserTradeBook brokerId={brokerId} userId={userId} />
                )}

                {activeTab === "orderbook" && (
                  <UserOrderBook brokerId={brokerId} userId={userId} />
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UserBrokerProfile;
