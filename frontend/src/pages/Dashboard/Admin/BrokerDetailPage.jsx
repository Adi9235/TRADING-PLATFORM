import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

const supportedExchanges = [
  "NSE",
  "BSE",
  "MCX",
  "NCDEX",
  "ICEX",
  "NSE FX",
  "BSE FX",
  "MSEI",
  "IEX",
  "PXIL",
];

const BrokerDetailPage = () => {
  const { id } = useParams();
  const [logoPreview, setLogoPreview] = useState(null);
  const [broker, setBroker] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      apiUrl: "",
      apiKey: "",
      apiSecret: "",
      logo: "",
      supportedExchanges: [],
      connectionFields: [],
    },
  });

  useEffect(() => {
    if (id) {
      fetchBrokerDetails(id);
    }
  }, [id]);

  const fetchBrokerDetails = (brokerId) => {
    setIsLoading(true);
    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/brokers/broker/${brokerId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((res) => {
        const brokerData = res?.data?.data;
        setBroker(brokerData);

        if (brokerData) {
          setValue("apiUrl", brokerData.apiUrl || "");
          setValue("apiKey", brokerData.apiKey || "");
          setValue("apiSecret", brokerData.apiSecret || "");
          setValue("logo", brokerData.logo || "");
          setLogoPreview(brokerData.logo || null);
          setValue("supportedExchanges", brokerData.supportedExchanges || []);

          if (
            Array.isArray(brokerData.connectionFields) &&
            brokerData.connectionFields.length > 0
          ) {
            setValue("connectionFields", brokerData.connectionFields);
          } else {
            setValue("connectionFields", [""]);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching broker:", err);
        setApiError("Failed to fetch broker details.");
      })
      .finally(() => setIsLoading(false));
  };

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");

    const dataToSend = {
      _id: id,

      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      logo: data.logo,
      connectionFields: data.connectionFields,
      supportedExchanges: data.supportedExchanges || [],
    };

    if (data.apiUrl) {
      dataToSend.apiUrl = data.apiUrl;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/brokers/update`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Broker successfully updated!");
      navigate("/dashboard/admin/broker-and-exchanges");
    } catch (error) {
      console.error("Error:", error);
      setApiError(
        error.response?.data?.message ||
          "Failed to update broker. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const watchLogo = watch("logo");

  useEffect(() => {
    setLogoPreview(watchLogo || null);
  }, [watchLogo]);

  return (
    <main className="p-6 min-h-screen bg-gray-50">
      <div className="mx-auto">
        <Link
          to="/dashboard/admin/broker-and-exchanges"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Brokers List
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {apiError && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-start">
              <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Broker Name
                  </label>
                  <p className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    {broker?.name}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Broker Id
                  </label>
                  <p className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    {broker?.brokerId}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    API URL
                  </label>
                  <input
                    type="text"
                    {...register("apiUrl")}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter API URL (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("apiKey", {
                      required: "API Key is required",
                    })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter API Key"
                  />
                  {errors.apiKey && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.apiKey.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    API Secret <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    {...register("apiSecret", {
                      required: "API Secret is required",
                    })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter API Secret"
                  />
                  {errors.apiSecret && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.apiSecret.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Logo URL <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    {logoPreview ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-50 flex items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Broker logo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-400 flex-shrink-0">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                      </div>
                    )}
                    <input
                      type="text"
                      {...register("logo", {
                        required: "Logo URL is required",
                      })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter Logo URL"
                    />
                  </div>
                  {errors.logo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.logo.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Connection Fields <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="connectionFields"
                    rules={{
                      required: "At least one connection field is required",
                      validate: (value) =>
                        (value && value.length > 0) ||
                        "At least one connection field is required",
                    }}
                    render={({ field }) => (
                      <div className="space-y-3">
                        {field.value?.map((fieldValue, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={fieldValue}
                              onChange={(e) => {
                                const newFields = [...field.value];
                                newFields[index] = e.target.value;
                                field.onChange(newFields);
                              }}
                              className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              placeholder={`Field ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFields = field.value.filter(
                                  (_, i) => i !== index
                                );
                                field.onChange(newFields);
                              }}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            field.onChange([...field.value, ""]);
                          }}
                          className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                          </svg>
                          Add Field
                        </button>
                      </div>
                    )}
                  />
                  {errors.connectionFields && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.connectionFields.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Supported Exchanges */}
            <div className="mt-8">
              <label className="block text-gray-700 font-medium mb-2">
                Supported Exchanges <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="supportedExchanges"
                rules={{
                  validate: (value) =>
                    (value && value.length > 0) ||
                    "At least one exchange must be selected",
                }}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-5 border border-gray-200 rounded-lg bg-gray-50">
                    {supportedExchanges.map((exchange) => (
                      <label
                        key={exchange}
                        className="flex items-center space-x-2 text-gray-700 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            value={exchange}
                            checked={field.value?.includes(exchange)}
                            onChange={(e) => {
                              const currentValues = field.value || [];
                              const newValue = e.target.checked
                                ? [...currentValues, exchange]
                                : currentValues.filter((ex) => ex !== exchange);
                              field.onChange(newValue);
                            }}
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                            {exchange}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.supportedExchanges && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.supportedExchanges.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <Link
                to="/dashboard/admin/broker-and-exchanges"
                className="mr-4 px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} className="mr-2" />
                    <span>Update Broker</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default BrokerDetailPage;
