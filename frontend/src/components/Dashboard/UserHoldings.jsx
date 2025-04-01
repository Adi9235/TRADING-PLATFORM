import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Wallet2, ArrowUpDown, Briefcase, Activity } from "lucide-react";

const StatsCard = ({ title, value, icon, color, textColor }) => {
  return (
    <div className={`${color} rounded-lg p-4 shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p
            className={`text-2xl font-semibold mt-1 ${
              textColor || "text-gray-900"
            }`}
          >
            {value}
          </p>
        </div>
        <div className="p-2 rounded-full bg-white bg-opacity-80">{icon}</div>
      </div>
    </div>
  );
};

const UserHoldings = ({ brokerId, userId, setPlaceOrder }) => {
  const [userHoldings, setUserHoldings] = useState(null);
  const [holdingsData, setHoldingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserHoldings = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/user-brokers/${brokerId}/all-holdings`;

      const url = userId ? `${baseUrl}?userId=${userId}` : baseUrl;
      console.log(url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("API Response:", response);

      if (response.data.success && response.data.data.status) {
        setUserHoldings(response.data.data.data.totalholding);
        setHoldingsData(response.data.data.data.holdings || []);
      } else {
        const errorMessage =
          response.data.data?.message ||
          response.data.message ||
          "Failed to load holdings";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching holdings:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load holdings. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brokerId) {
      fetchUserHoldings();
    } else {
      toast.error("Broker ID is required.");
      setLoading(false);
    }
  }, [brokerId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-md">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <button
          onClick={fetchUserHoldings}
          className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!userHoldings) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        No holdings data available.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Holdings Value"
          value={`₹${userHoldings.totalholdingvalue?.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`}
          icon={<Wallet2 size={24} className="text-green-600" />}
          color="bg-green-50"
        />
        <StatsCard
          title="Total Invested Value"
          value={`₹${userHoldings.totalinvvalue?.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`}
          icon={<ArrowUpDown size={24} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatsCard
          title="Total Profit/Loss"
          value={`₹${userHoldings.totalprofitandloss?.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`}
          icon={<Briefcase size={24} className="text-indigo-600" />}
          color="bg-indigo-50"
        />
        <StatsCard
          title="P&L Percentage"
          value={`${
            userHoldings.totalpnlpercentage >= 0 ? "+" : ""
          }${userHoldings.totalpnlpercentage?.toFixed(2)}%`}
          icon={
            <Activity
              size={24}
              className={
                userHoldings.totalpnlpercentage >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            />
          }
          color={
            userHoldings.totalpnlpercentage >= 0 ? "bg-green-50" : "bg-red-50"
          }
          textColor={
            userHoldings.totalpnlpercentage >= 0
              ? "text-green-600"
              : "text-red-600"
          }
        />
      </div>

      <div className="flex items-end justify-end">
        <button
          type="button"
          onClick={() => setPlaceOrder(true)}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Place Order
        </button>
      </div>
      {holdingsData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Your Holdings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Symbol", "Qty", "Avg Price", "LTP", "P&L"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdingsData.map((holding, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {holding.tradingsymbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {holding.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₹{holding.averageprice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₹{holding.ltp.toFixed(2)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap ${
                        holding.profitandloss >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹{holding.profitandloss.toFixed(2)} (
                      {holding.pnlpercentage >= 0 ? "+" : ""}
                      {holding.pnlpercentage.toFixed(2)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHoldings;
