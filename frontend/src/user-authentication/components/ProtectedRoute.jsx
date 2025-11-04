import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireCartItems = false
}) {
  const { user, token, cart, setRedirectPath, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // ✅ Back navigation guard
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

  // ✅ Auth check (safe setRedirectPath)
  useEffect(() => {
    if (!user?.id || !token) {
      setRedirectPath(location.pathname);
      setShouldRedirect(true);
    }
  }, [user, token, location.pathname, setRedirectPath]);

  if (shouldRedirect) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Admin check (only if user is present)
  if (requireAdmin && user?.id && !user.isAdmin) {
    alert("Admin access required.");
    return <Navigate to="/" replace />;
  }

  // ✅ Cart check
  if (requireCartItems) {
    const stateCartItems = location.state?.cartItems;
    const hasValidCart =
      Array.isArray(stateCartItems) && stateCartItems.length > 0
        ? true
        : Array.isArray(cart) && cart.length > 0;

    if (!hasValidCart) {
      alert("You must have items in your cart to proceed.");
      return <Navigate to="/cart" replace />;
    }
  }

  if (!children) return <div>Loading...</div>;

  return children;
}
