import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Route, Routes } from "react-router";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import DashboardLayout from "./pages/Layout/DashboardLayout";
import UserDashboard from "./pages/Dashboard/User/UserDashboard";
import BrokerExchange from "./pages/Dashboard/User/BrokerExchanges";
import AuthContextProvider from "./context/AuthContextProvider";
import AdminDashboard from "./pages/Dashboard/Admin/AdminDashboard";
import BrokerExchangesAdmin from "./pages/Dashboard/Admin/BrokerExchangesAdmin";
import AddNewBroker from "./pages/Dashboard/Admin/AddNewBroker";
import BrokerDetailPage from "./pages/Dashboard/Admin/BrokerDetailPage";
import AllUsers from "./pages/Dashboard/Admin/AllUsers";
import UserBrokerProfile from "./pages/Dashboard/User/UserBrokerProfile";
import UserPage from "./pages/Dashboard/Admin/UserPage";
import ProtectedRoutes from "./components/Common/ProtectedRoutes";

function App() {
  return (
    <>
      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoutes>
                <DashboardLayout />{" "}
              </ProtectedRoutes>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="broker-and-exchanges" element={<BrokerExchange />} />
            <Route
              path="broker-and-exchanges/:brokerId"
              element={<UserBrokerProfile />}
            />
          </Route>

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoutes>
                {" "}
                <DashboardLayout />{" "}
              </ProtectedRoutes>
            }
          >
            <Route path="users" element={<AllUsers />} />
            <Route path="users/:userId" element={<UserPage />} />
            <Route
              path="users/:userId/brokers/:brokerId"
              element={<UserBrokerProfile />}
            />
            <Route
              path="broker-and-exchanges"
              element={<BrokerExchangesAdmin />}
            />
            <Route
              path="broker-and-exchanges/:id"
              element={<BrokerDetailPage />}
            />
            <Route
              path="broker-and-exchanges/create"
              element={<AddNewBroker />}
            />
          </Route>
        </Routes>
      </AuthContextProvider>
    </>
  );
}

export default App;
