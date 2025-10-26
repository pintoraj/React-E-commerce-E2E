import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, setRedirectPath, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Intercept back navigation on protected routes
  useEffect(() => {
    const handlePopState = () => {
      const confirmLogout = window.confirm("Do you want to logout to go back?");
      if (confirmLogout) {
        logout();
        navigate('/login', { replace: true });
      } else {
        navigate(location.pathname, { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [logout, navigate, location.pathname]);

  // Guard for login
  if (!user?.id) {
    setRedirectPath(location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Guard for admin access
  if (requireAdmin && !user.isAdmin) {
    toast.error("Admin access required.");
    return <Navigate to="/" replace />;
  }

  // Optional fallback to prevent blank screen
  if (!children) return <div>Loading...</div>;

  return children;
}
