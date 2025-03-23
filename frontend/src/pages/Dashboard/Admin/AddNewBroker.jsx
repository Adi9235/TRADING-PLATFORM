import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

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

const AddBroker = () => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    const dataToSend = {
      name: data?.name,
      apiKey: data?.apiKey,
      apiSecret: data?.apiSecret,
      logo: data?.logo,
      connectionFields: data?.connectionFields || [],
      supportedExchanges: data?.supportedExchanges || [],
    };
    if (data?.apiUrl) {
      dataToSend.apiUrl = data?.apiUrl;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/brokers/create`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Broker successfully added!");
      navigate("/dashboard/admin/broker-and-exchanges");
    } catch (error) {
      console.error("Error:", error);
      setApiError(
        error.response?.data?.message ||
          "Failed to add broker. Please try again."
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
      <div className=" mx-auto">
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
                    Broker Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Broker name is required",
                    })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter broker name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
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
                    }}
                    render={({ field }) => (
                      <input
                        type="text"
                        value={field.value?.join(", ") || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((f) => f.trim())
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="E.g., client_id, password, totp"
                      />
                    )}
                  />
                  {errors.connectionFields && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.connectionFields.message}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    Separate each field with a comma
                  </p>
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
                    value?.length > 0 ||
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
                              const newValue = e.target.checked
                                ? [...(field.value || []), exchange]
                                : field.value?.filter((ex) => ex !== exchange);
                              setValue("supportedExchanges", newValue);
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} className="mr-2" />
                    <span>Save Broker</span>
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

export default AddBroker;
