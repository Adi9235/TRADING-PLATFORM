import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const UserBrokers = ({ userId }) => {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) fetchUserBrokers();
  }, [userId]);

  const fetchUserBrokers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/user/${userId}/broker-connections`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBrokers(response?.data?.data);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      toast.error("Failed to load brokers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800">Connected Brokers</h2>

      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      ) : brokers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Broker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brokers.map((broker) => (
                <tr key={broker._id}>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <img
                      src={broker.brokerId.logo}
                      alt={broker.brokerId?.name}
                      className="w-10 h-10 rounded-md"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {broker?.brokerId?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        broker.isConnected
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {broker.isConnected ? "Connected" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {broker?.isConnected ? (
                      <Link
                        to={`brokers/${broker?.brokerId?._id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View
                      </Link>
                    ) : (
                      <span className="text-gray-400 cursor-not-allowed font-medium">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          No brokers connected yet.
        </div>
      )}
    </div>
  );
};

export default UserBrokers;
