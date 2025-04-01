import axios from "axios";
import { X, Loader } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const BrokerPlaceOrder = ({ setPlaceOrder, brokerId }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      variety: "NORMAL",
      tradingsymbol: "",
      symboltoken: "",
      transactiontype: "BUY",
      exchange: "NSE",
      ordertype: "LIMIT",
      producttype: "INTRADAY",
      duration: "DAY",
      disclosedquantity: "",
      quantity: "",
    },
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    console.log(data);
    setError(null);
    if (!brokerId) {
      setError("Broker ID is required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user-brokers/place-order`,
        {
          ...data,
          brokerId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(response.data, "response");
      if (response.data.success) {
        setPlaceOrder(false);
        toast.success("Order placed successfully");
      } else {
        setError(response.data.message || "Failed to place order");
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while placing the order. Please try again."
      );
      toast.error(
        error.response?.data?.message ||
          "An error occurred while placing the order"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setError(null);
  };

  const fields = [
    {
      name: "variety",
      label: "Variety",
      type: "select",
      options: ["NORMAL", "STOPLOSS", "AMO", "BRACKET", "COVER"],
    },
    { name: "tradingsymbol", label: "Trading Symbol", type: "text" },
    { name: "symboltoken", label: "Symbol Token", type: "text" },
    {
      name: "transactiontype",
      label: "Transaction Type",
      type: "radio",
      options: ["BUY", "SELL"],
    },
    { name: "disclosedquantity", label: "Disclosed Quantity", type: "number" },
    {
      name: "ordertype",
      label: "Order Type",
      type: "select",
      options: ["LIMIT", "MARKET", "STOPLOSS"],
    },
    {
      name: "producttype",
      label: "Product Type",
      type: "select",
      options: ["INTRADAY", "DELIVERY"],
    },
    {
      name: "duration",
      label: "Duration",
      type: "select",
      options: ["DAY", "IOC"],
    },
    { name: "quantity", label: "Quantity", type: "number" },
    {
      name: "exchange",
      label: "Exchange",
      type: "select",
      options: ["NSE", "BSE", "MCX"],
    },
  ];

  const renderField = (field) => {
    const { name, label, type, options } = field;

    return (
      <div key={name} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {type === "select" ? (
          <select
            {...register(name, { required: "This field is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : type === "radio" ? (
          <div className="flex space-x-4">
            {options.map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  value={option}
                  {...register(name, { required: "This field is required" })}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <input
            type={type}
            {...register(name, { required: "This field is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )}
        {errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Place Order</h2>
        <button
          onClick={() => setPlaceOrder(false)}
          className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
          disabled={isLoading}
        >
          <X size={18} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {fields.map(renderField)}
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 mr-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-24"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrokerPlaceOrder;
