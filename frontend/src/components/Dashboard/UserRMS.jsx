import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const UserRMS = ({ brokerId, userId }) => {
  const [rmsData, setRmsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRMSData = async () => {
    setLoading(true);
    try {
      const baseUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/user-brokers/${brokerId}/rms`;

      const url = userId ? `${baseUrl}?userId=${userId}` : baseUrl;
      console.log(url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("RMS", response);
      setRmsData(response?.data?.data?.data);
    } catch (error) {
      console.error("Error fetching RMS data:", error);
      toast.error("Failed to load RMS data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRMSData();
  }, [brokerId, userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-md">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    console.log(value);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(+value);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Risk Management System (RMS)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Net</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Available
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {rmsData ? formatCurrency(rmsData.net) : "₹0"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Available Cash
            </h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Funds
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {rmsData ? formatCurrency(rmsData.availablecash) : "₹0"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Intraday Payin
            </h3>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              Available
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {rmsData ? formatCurrency(rmsData.availableintradaypayin) : "₹0"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Limit Margin</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Available
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {rmsData ? formatCurrency(rmsData.availablelimitmargin) : "₹0"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Collateral</h3>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              Value
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {rmsData ? formatCurrency(rmsData.collateral) : "₹0"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-pink-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              M2M Unrealized
            </h3>
            <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
              P&L
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {rmsData ? formatCurrency(rmsData.m2munrealized) : "₹0"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-md font-semibold text-gray-700 mb-4">
          Utilization Details
        </h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Utilization Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rmsData &&
                [
                  { name: "Utilized Debits", value: rmsData.utiliseddebits },
                  { name: "Utilized Span", value: rmsData.utilisedspan },
                  {
                    name: "Utilized Option Premium",
                    value: rmsData.utilisedoptionpremium,
                  },
                  {
                    name: "Utilized Holding Sales",
                    value: rmsData.utilisedholdingsales,
                  },
                  {
                    name: "Utilized Exposure",
                    value: rmsData.utilisedexposure,
                  },
                  {
                    name: "Utilized Turnover",
                    value: rmsData.utilisedturnover,
                  },
                  { name: "Utilized Payout", value: rmsData.utilisedpayout },
                  { name: "M2M Realized", value: rmsData.m2mrealized },
                ].map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserRMS;
