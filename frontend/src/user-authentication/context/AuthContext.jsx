import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const AuthContext = createContext();
const API = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);

  const isAuthenticated = !!user?.id && !!token;
  const isAdmin = user?.isAdmin === true;

  // ✅ Load from localStorage on first mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      const storedToken = localStorage.getItem("authToken");
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
          setUser(parsedUser);
          setToken(storedToken);
          
        }
      }
    } catch {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
    }
  }, []);

  // ✅ Persist to localStorage on change
  useEffect(() => {
    try {
      if (user && token) {
        localStorage.setItem("authUser", JSON.stringify(user));
        localStorage.setItem("authToken", token);
        
      } else {
        localStorage.removeItem("authUser");
        localStorage.removeItem("authToken");
        
      }
    } catch {}
  }, [user, token]);

  // ✅ Login with token + user
  const login = ({ token, user }, onLoginSuccess) => {
    
    setUser(user);
    setToken(token);
    setRedirectPath(null);
    if (typeof onLoginSuccess === "function") {
      setTimeout(() => onLoginSuccess(user), 0); // ✅ Avoid calling during render
    }
  };

  // ✅ Logout and clear everything
  const logout = (onLogout) => {
    console.log("🚪 Logging out");
    setUser(null);
    setToken(null);
    setRedirectPath(null);
    try {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      sessionStorage.clear();
    } catch {}
    if (typeof onLogout === "function") {
      setTimeout(() => onLogout(), 0); // ✅ Avoid calling during render
    }
    window.location.replace("/login");
  };

  // ✅ Login via backend
  const loginWithBackend = async (identifier, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      const contentType = res.headers.get("Content-Type");
      if (!res.ok || !contentType?.includes("application/json")) {
        console.error("❌ Login failed: bad response or non-JSON");
        setUser(null);
        setToken(null);
        return;
      }

      const { token, user } = await res.json();
      if (token && user?.id) {
        login({ token, user });
      } else {
        console.error("❌ Login failed: missing token or user");
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        loginWithBackend,
        redirectPath,
        setRedirectPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
