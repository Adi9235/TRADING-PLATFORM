import { useState, useEffect } from "react";
import { User, BriefcaseIcon, PlusCircle, Trash2 } from "lucide-react";
import { useParams } from "react-router";
import axios from "axios";
import { toast } from "react-hot-toast";
import UserBrokers from "../../../components/Dashboard/UserBrokers";

export default function UserPage() {
  const { userId } = useParams();
  const [user, setUser] = useState({});
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser(response?.data?.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          User Information
        </h1>

        {/* Personal Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <User className="mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={user?.name || ""}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={user?.email || ""}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <UserBrokers userId={userId} />
      </div>
    </div>
  );
}
