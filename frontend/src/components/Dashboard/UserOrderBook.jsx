import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const UserOrderBook = ({ brokerId, userId }) => {
  const [userOrderBook, setUserOrderBook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/user-brokers/${brokerId}/order-book`;

      const url = userId ? `${baseUrl}?userId=${userId}` : baseUrl;
      console.log(url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserOrderBook(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching order book:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load order book. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brokerId) {
      fetchUserOrder();
    }
  }, [brokerId]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading order book...</p>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchUserOrder}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!userOrderBook.length) {
    return <p className="text-center text-red-500">No order data available.</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Order Book</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Order ID",
                "Symbol",
                "Type",
                "Quantity",
                "Price",
                "Status",
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
            {userOrderBook.map((order) => (
              <tr key={order.orderId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderId || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {order.symbol || "N/A"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    order.type === "BUY" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {order.type || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {order.quantity || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  ₹{order.price ? order.price.toFixed(2) : "N/A"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    order.status === "COMPLETED"
                      ? "text-green-600"
                      : order.status === "PENDING"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {order.status || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.timestamp
                    ? new Date(order.timestamp).toLocaleString("en-IN", {
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

export default UserOrderBook;
