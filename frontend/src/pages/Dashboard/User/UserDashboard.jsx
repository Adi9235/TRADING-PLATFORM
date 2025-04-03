import React from "react";

const UserDashboard = () => {
  return (
    <main className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Welcome to your Trading Dashboard
        </h2>
        <p className="text-gray-600">
          Connect your broker account to start trading. View your portfolio,
          place orders, and monitor market movements all in one place.
        </p>

        {/* Dashboard Content */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Market Overview Card */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-2">Market Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">NIFTY 50</span>
                <span className="text-green-600">22,475.52 +0.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SENSEX</span>
                <span className="text-green-600">73,648.62 +0.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BANK NIFTY</span>
                <span className="text-red-600">47,852.33 -0.2%</span>
              </div>
            </div>
          </div>

          {/* Portfolio Summary Card */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-2">Portfolio Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Value</span>
                <span className="font-medium">₹1,25,432.80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Day's P&L</span>
                <span className="text-green-600">+₹2,450.25 (+1.9%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overall P&L</span>
                <span className="text-green-600">+₹15,432.80 (+12.3%)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                Place New Order
              </button>
              <button className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                Add Funds
              </button>
              <button className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                Set Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserDashboard;
