import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const BrokerList = () => {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBrokers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/brokers/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBrokers(response?.data?.data);
    } catch (error) {
      console.error("Error fetching brokers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className=" mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex justify-end items-center p-6 border-b border-gray-200">
          <Link
            to="/dashboard/admin/broker-and-exchanges/create"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors duration-200"
          >
            <Plus size={18} className="mr-2" /> Add New Broker
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-pulse flex space-x-4">
              <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        ) : brokers.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-6">
              No brokers available yet
            </p>
            <Link
              to="/dashboard/admin/broker-and-exchanges/create"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md inline-flex items-center transition-colors duration-200"
            >
              <Plus size={18} className="mr-2" /> Add Your First Broker
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 tracking-wider">
                    Broker ID
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 tracking-wider">
                    Supported Exchanges
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {brokers.map((broker) => (
                  <tr
                    key={broker._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            src={broker.logo}
                            alt={broker.name}
                            className="h-12 w-12 rounded-md object-cover shadow-sm"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-medium text-gray-800">
                            {broker.name} ({broker._id})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {broker.brokerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {broker.supportedExchanges.join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      <div className="flex justify-center space-x-3">
                        <Link
                          to={`/dashboard/admin/broker-and-exchanges/${broker._id}`}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-150"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-150">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerList;
