import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const UserPositions = ({ brokerId, userId }) => {
  const [userPositions, setUserPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserPositions = async () => {
    if (!brokerId) {
      toast.error("Broker ID is missing.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/user-brokers/${brokerId}/positions`;

      const url = userId ? `${baseUrl}?userId=${userId}` : baseUrl;
      console.log(url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Positions Response:", response?.data);

      if (!response?.data?.success || !response?.data?.data) {
        setUserPositions([]);
        return;
      }

      setUserPositions(
        Array.isArray(response?.data?.data) ? response.data.data : []
      );
    } catch (error) {
      console.error("Error fetching positions:", error?.response || error);
      const errorMessage =
        error?.response?.data?.message || "Failed to load positions.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPositions();
  }, [brokerId]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading positions...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
        <p>Error: {error}</p>
        <button
          onClick={fetchUserPositions}
          className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!userPositions.length) {
    return (
      <p className="text-center text-red-500">No position data available.</p>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Current Positions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LTP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                P&L
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userPositions.map((position, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {position.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {position.product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {position.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{position.avgPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{position.ltp.toFixed(2)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap ${
                    position.pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ₹{position.pnl.toFixed(2)} ({position.pnl >= 0 ? "+" : ""}
                  {position.pnlPercentage.toFixed(2)}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPositions;
