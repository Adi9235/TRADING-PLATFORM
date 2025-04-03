import useProtectedRoute from "../../hooks/useProtectedRoute";

const ProtectedRoutes = ({ children }) => {
  const { loading, isAuthenticated } = useProtectedRoute();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoutes;
