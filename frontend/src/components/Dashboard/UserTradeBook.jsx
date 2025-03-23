import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const UserTradeBook = ({ brokerId, userId }) => {
  const [userTradeBook, setUserTradeBook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserTrade = async () => {
    if (!brokerId) {
      toast.error("Broker ID is missing.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/user-brokers/${brokerId}/trade-book`;

      const url = userId ? `${baseUrl}?userId=${userId}` : baseUrl;
      console.log(url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Trade Book Response:", response?.data);

      if (!response?.data?.success || !response?.data?.data) {
        setUserTradeBook([]);
        return;
      }

      setUserTradeBook(
        Array.isArray(response?.data?.data) ? response.data.data : []
      );
    } catch (error) {
      console.error("Error fetching trade book:", error?.response || error);
      const errorMessage =
        error?.response?.data?.message || "Failed to load trade book.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTrade();
  }, [brokerId]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading trade book...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
        <p>Error: {error}</p>
        <button
          onClick={fetchUserTrade}
          className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!userTradeBook.length) {
    return <p className="text-center text-red-500">No trade data available.</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Trade Book</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Trade ID",
                "Symbol",
                "Type",
                "Quantity",
                "Price",
                "Value",
                "Time",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userTradeBook.map((trade) => (
              <tr
                key={trade?.tradeId || Math.random()}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {trade?.tradeId || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {trade?.symbol || "N/A"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    trade?.type === "BUY" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trade?.type || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {trade?.quantity ?? "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  ₹{trade?.price ? trade.price.toFixed(2) : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  ₹{trade?.value ? trade.value.toFixed(2) : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trade?.timestamp
                    ? new Date(trade.timestamp).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTradeBook;
