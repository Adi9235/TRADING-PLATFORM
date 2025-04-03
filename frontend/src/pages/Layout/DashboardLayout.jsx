import React, { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  User,
  X,
  BarChart2,
  Briefcase,
  DollarSign,
  PieChart,
  Activity,
  Settings,
  HelpCircle,
  BookOpen,
  Home,
} from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router";
import axios from "axios";
import useAuth from "../../hooks/useAuth";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  console.log(user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  const userNavItems = [
    { id: "", icon: <Home size={20} />, label: "Dashboard" },
    { id: "market", icon: <BarChart2 size={20} />, label: "Market" },
    { id: "portfolio", icon: <Briefcase size={20} />, label: "Portfolio" },
    { id: "orders", icon: <Activity size={20} />, label: "Orders" },
    { id: "funds", icon: <DollarSign size={20} />, label: "Funds" },
    { id: "analytics", icon: <PieChart size={20} />, label: "Analytics" },
    { id: "research", icon: <BookOpen size={20} />, label: "Research" },
    { id: "settings", icon: <Settings size={20} />, label: "Settings" },
    { id: "help", icon: <HelpCircle size={20} />, label: "Help & Support" },
  ];

  const adminNavItems = [
    { id: "users", icon: <User size={20} />, label: "Users" },
    {
      id: "broker-and-exchanges",
      icon: <BookOpen size={20} />,
      label: "Brokers & Exchanges",
    },
    {
      id: "adminSettings",
      icon: <Settings size={20} />,
      label: "Admin Settings",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 ease-in-out fixed h-full`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <div className={`${sidebarOpen ? "flex" : "hidden"} items-center`}>
            <h1 className="text-xl font-bold">TradeApp</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="py-4">
          <nav>
            {(user?.role === "ADMIN" ? adminNavItems : userNavItems).map(
              (item) => (
                <Link
                  key={item.id}
                  to={`${item.id}`}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center px-4 py-3 ${
                    activePage === item.id ? "bg-blue-600" : "hover:bg-gray-700"
                  } transition-colors duration-200`}
                >
                  <span className="text-gray-300">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="ml-4 text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            )}
          </nav>
        </div>

        {/* Connect Broker Button */}
        {sidebarOpen && user?.role === "USER" && (
          <div className="absolute bottom-8 left-0 right-0 px-4">
            <Link to="/dashboard/user/broker-and-exchanges">
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none">
                Connect Broker Account
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300 ease-in-out`}
      >
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="text-xl font-semibold text-gray-800">
              {(user?.role === "ADMIN" ? adminNavItems : userNavItems).find(
                (item) => item.id === activePage
              )?.label || "Dashboard"}
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                <Bell size={20} />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full text-sm bg-blue-600 flex items-center justify-center text-white">
                    {/* <User size={16} /> */}
                    {user?.name
                      .split(" ")
                      .map((name) => name[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                  <ChevronDown size={16} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <a
                      href="#profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Account Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
