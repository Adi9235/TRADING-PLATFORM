import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  CheckCircle,
  Link as LinkIcon,
  AlertCircle,
  Lock,
  User,
  LogOut,
  Search,
  RefreshCw,
  Loader,
  X,
  ExternalLink,
  Settings,
} from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router";

const BrokerExchange = () => {
  const { register, handleSubmit, reset } = useForm();
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user-brokers/all`,
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

  useEffect(() => {
    fetchBrokers();
  }, []);

  const handleConnect = async (brokerId) => {
    const broker = brokers.find((b) => b._id === brokerId);
    setSelectedBroker(broker);
    setIsConnecting(true);
    reset();
  };

  const handleConnectBroker = async (data) => {
    if (formSubmitting) return;

    setFormSubmitting(true);
    try {
      const fields = selectedBroker.connectionFields.map((field) => ({
        [field]: data?.[field] || "",
      }));
      const mergedFields = Object.assign({}, ...fields);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user-brokers/connect`,
        {
          brokerId: selectedBroker?._id,
          ...mergedFields,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Broker connected successfully!");
      setIsConnecting(false);
      fetchBrokers();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to connect broker");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDisconnect = async (brokerId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user-brokers/disconnect`,
        {
          brokerId: brokerId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);

      if (response.data.success) {
      }
      toast.success("Broker disconnected successfully!");
      fetchBrokers();
    } catch (error) {
      console.error("Error disconnecting broker:", error);
      toast.error(
        error?.response?.data?.message || "Failed to disconnect broker"
      );
      setLoading(false);
    }
  };

  const filteredBrokers = brokers.filter((broker) => {
    const matchesSearch = broker.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "connected")
      return broker?.userBroker?.isConnected && matchesSearch;
    if (activeTab === "disconnected")
      return !broker?.userBroker?.isConnected && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Broker Accounts
            </h1>
            <button
              onClick={fetchBrokers}
              disabled={loading}
              className="flex items-center text-sm font-medium px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {loading ? (
                <Loader size={14} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={14} className="mr-2" />
              )}
              {loading ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Search brokers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex">
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Brokers
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "connected"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("connected")}
            >
              Connected
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "disconnected"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("disconnected")}
            >
              Not Connected
            </button>
          </div>
        </div>

        {/* Brokers Grid */}
        {loading ? (
          <div className="flex justify-center items-center p-12 bg-white rounded-lg shadow">
            <div className="flex items-center space-x-2">
              <Loader size={20} className="animate-spin text-blue-600" />
              <span className="text-gray-600 text-sm">Loading brokers...</span>
            </div>
          </div>
        ) : filteredBrokers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <AlertCircle size={40} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-medium text-gray-700 mb-1">
              No brokers found
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? "Try adjusting your search"
                : "No brokers available for this filter"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBrokers.map((broker) => (
              <div
                key={broker._id}
                className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 transition-all hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-md border border-gray-100 p-2 mr-3">
                      <img
                        src={broker.logo}
                        alt={`${broker.name} logo`}
                        className="max-h-8 max-w-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {broker.name}
                        </h3>
                        {broker?.userBroker?.isConnected && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded flex items-center">
                            <CheckCircle size={10} className="mr-1" />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {broker.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {broker.supportedExchanges &&
                      broker.supportedExchanges.map((exchange) => (
                        <span
                          key={exchange}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {exchange}
                        </span>
                      ))}
                  </div>

                  {broker?.userBroker?.isConnected ? (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <Link
                        to={broker._id}
                        className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700"
                      >
                        <ExternalLink size={14} className="mr-1.5" />
                        View Details
                      </Link>
                      <button
                        className="text-gray-600 text-sm flex items-center hover:text-red-600 transition-colors"
                        onClick={() => handleDisconnect(broker._id)}
                      >
                        <LogOut size={14} className="mr-1.5" />
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                      onClick={() => handleConnect(broker._id)}
                    >
                      <LinkIcon size={14} className="mr-2" />
                      Connect Account
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Connection Modal */}
      {isConnecting && selectedBroker && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Connect to {selectedBroker.name}
              </h3>
              <button
                onClick={() => setIsConnecting(false)}
                className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
                disabled={formSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-md border border-gray-100 p-2">
                  <img
                    src={selectedBroker.logo}
                    alt={`${selectedBroker.name} logo`}
                    className="max-h-6 max-w-full"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {selectedBroker.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Enter your credentials to connect
                  </p>
                </div>
              </div>

              <form className="space-y-4">
                {selectedBroker.connectionFields.map((field) => (
                  <div key={field}>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      {field}
                    </label>
                    <input
                      {...register(field)}
                      type={
                        field.toLowerCase().includes("password")
                          ? "password"
                          : "text"
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder={`Enter your ${field.toLowerCase()}`}
                      disabled={formSubmitting}
                    />
                  </div>
                ))}

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleSubmit(handleConnectBroker)}
                    disabled={formSubmitting}
                    className={`w-full flex justify-center items-center py-2 px-4 rounded-md text-white text-sm font-medium ${
                      formSubmitting
                        ? "bg-blue-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  >
                    {formSubmitting ? (
                      <>
                        <Loader size={14} className="animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LinkIcon size={14} className="mr-2" />
                        Connect Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerExchange;
