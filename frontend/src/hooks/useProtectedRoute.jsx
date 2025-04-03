import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "./useAuth.jsx";
import { useEffect } from "react";

const useProtectedRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate("/", {
        state: { from: location.pathname },
      });
    }
  }, [isAuthenticated, loading, navigate, location]);

  return { loading, isAuthenticated, user };
};

export default useProtectedRoute;
