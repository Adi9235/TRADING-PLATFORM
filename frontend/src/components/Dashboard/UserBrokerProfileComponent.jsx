import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "lucide-react";
import { toast } from "react-hot-toast";

const UserBrokerProfileComponent = ({ brokerId, broker, userId }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(userId, "user");
  const fetchUserBrokerProfile = async () => {
    setLoading(true);
    try {
      const baseUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/user-brokers/${brokerId}/profile`;

      const url = userId ? `${baseUrl}?userId=${userId}` : baseUrl;
      console.log(url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUserProfile(response?.data?.data?.data);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      toast.error("Failed to load broker profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brokerId) {
      fetchUserBrokerProfile();
    }
  }, [brokerId]);

  if (loading) {
    return (
      <p className="text-center text-gray-500">Loading broker profile...</p>
    );
  }

  if (!userProfile) {
    return (
      <p className="text-center text-red-500">Failed to load broker profile.</p>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* User Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="bg-indigo-100 p-3 rounded-full">
            <User size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {userProfile.name}
            </h1>
            <p className="text-gray-600">
              {userProfile.email || "No email provided"}
            </p>
          </div>
        </div>

        {/* Broker Info */}
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          {broker?.logo && (
            <img
              src={broker?.logo}
              alt="Broker Logo"
              className="h-10 w-10 rounded-full"
            />
          )}
          <div>
            <p className="text-sm text-gray-500">Trading with</p>
            <p className="font-medium text-gray-800">
              {broker?.name || "Unknown Broker"}
            </p>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Client Code
          </h3>
          <p className="text-base font-medium">{userProfile.clientcode}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Mobile Number
          </h3>
          <p className="text-base font-medium">
            {userProfile.mobileno || "Not provided"}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Last Login Time
          </h3>
          <p className="text-base font-medium">
            {userProfile.lastlogintime || "No data"}
          </p>
        </div>
      </div>

      {/* Exchanges and Products */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Trading Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Exchanges
            </h4>
            <div className="flex flex-wrap gap-2">
              {userProfile.exchanges?.length ? (
                userProfile.exchanges.map((exchange, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-600 rounded-full"
                  >
                    {exchange}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No exchanges available</p>
              )}
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Products</h4>
            <div className="flex flex-wrap gap-2">
              {userProfile.products?.length ? (
                userProfile.products.map((product, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-green-100 text-green-600 rounded-full"
                  >
                    {product}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No products available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBrokerProfileComponent;
