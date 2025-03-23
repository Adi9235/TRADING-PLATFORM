import React from "react";

const LTPData = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Latest Market Prices</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(ltpData)
          .slice(0, 8)
          .map(([symbol, data]) => (
            <div
              key={symbol}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <h3 className="font-medium text-gray-900">{symbol}</h3>
              <div className="mt-2 text-2xl font-semibold">
                ₹{data.price?.toFixed(2) || "N/A"}
              </div>
              <div
                className={`text-sm font-medium ${
                  data.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {data.change >= 0 ? "+" : ""}
                {data.change?.toFixed(2) || 0} (
                {data.changePercent?.toFixed(2) || 0}%)
              </div>
            </div>
          ))}
      </div>
      <div className="mt-4 text-sm text-gray-500 text-right">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default LTPData;
