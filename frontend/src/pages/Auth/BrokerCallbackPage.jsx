import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

const BrokerCallbackPage = () => {
  const [params] = useSearchParams();

  const authToken = params.get("auth_token");
  const refreshToken = params.get("refresh_token");

  console.log(authToken, "AUTH");
  console.log(refreshToken, "REFRESH");

  useEffect(() => {
    console.log("Referrer:", document.referrer);
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleConnectBroker = async () => {
    if (!authToken || !refreshToken) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user-brokers/connect`,
        { authToken, refreshToken, brokerId: "ANGEL_ONE" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = "/dashboard/user/broker-and-exchanges";
        }, 5000);
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error(
        "Error connecting broker:",
        error.response?.data || error.message
      );
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleConnectBroker();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isSuccess]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-6">
          {isLoading ? (
            <svg
              className="w-16 h-16 mx-auto animate-spin text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="4" />
              <path d="M12 2a10 10 0 0110 10" strokeWidth="4" />
            </svg>
          ) : isSuccess ? (
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-16 h-16 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isLoading
            ? "Connecting to Broker..."
            : isSuccess
            ? "Successfully Connected!"
            : "Connection Failed"}
        </h1>

        <p className="text-gray-600 mb-6">
          {isLoading
            ? "We are processing your broker authentication. Please hold on..."
            : isSuccess
            ? `Your broker has been successfully connected! Redirecting to your dashboard in ${countdown} second${
                countdown !== 1 ? "s" : ""
              }...`
            : "We encountered an issue while connecting. Please try again or contact support."}
        </p>

        {isSuccess && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 5) * 100}%` }}
            ></div>
          </div>
        )}

        <div className="flex justify-center">
          {isSuccess ? (
            <Link
              to="/dashboard/user/broker-and-exchanges"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Dashboard Now
            </Link>
          ) : (
            isError && (
              <Link
                to="/dashboard/user/broker-and-exchanges"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry Connection
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerCallbackPage;
