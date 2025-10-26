import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("authUser");
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.id ? parsed : null;
    } catch {
      return null;
    }
  });

  const [redirectPath, setRedirectPath] = useState(null);
  const hasEnsuredAdmin = useRef(false);
  const isAuthenticated = !!user?.id;
  const isAdmin = user?.isAdmin === true;

  // ✅ Persist user session
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [user]);

  // ✅ Auto-clean invalid sessions
  useEffect(() => {
    const raw = localStorage.getItem("authUser");
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed?.id || typeof parsed?.isAdmin === "undefined") {
        localStorage.removeItem("authUser");
        setUser(null);
      }
    } catch {
      localStorage.removeItem("authUser");
      setUser(null);
    }
  }, []);

  // ✅ Ensure admin exists
  useEffect(() => {
    async function ensureAdmin() {
      if (hasEnsuredAdmin.current) return;
      hasEnsuredAdmin.current = true;

      try {
        const res = await fetch("http://localhost:3001/users");
        if (!res.ok) return;

        const allUsers = await res.json();
        const admins = allUsers.filter((u) => u.isAdmin === true);

        if (admins.length === 0) {
          await fetch("http://localhost:3001/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "Admin",
              email: "admin@gmail.com",
              password: "Admin123",
              isAdmin: true,
              addresses: [],
              paymentMethods: [],
              cart: [],
              wishlist: [],
              orders: []
            })
          });
        }
      } catch {
        // silent fail
      }
    }

    ensureAdmin();
  }, []);

  // ✅ Login handler
  const login = (userData, onLoginSuccess) => {
    if (userData?.isAdmin) {
      setRedirectPath(null);
    }
    setUser(userData);
    if (typeof onLoginSuccess === "function") onLoginSuccess(userData);
  };

  // ✅ Logout handler with redirect + reload
  const logout = (onLogout) => {
    setUser(null);
    setRedirectPath(null);
    try {
      localStorage.removeItem("authUser");
      sessionStorage.clear();
      localStorage.clear();
    } catch {
      // ignore
    }
    if (typeof onLogout === "function") onLogout();

    // ✅ Force redirect and reload to prevent back nav
    window.location.replace("/login");
  };

  // ✅ Backend login
  const loginWithBackend = async (username, password) => {
    try {
      const res = await fetch(
        `http://localhost:3001/users?username=${username}&password=${password}`
      );
      if (!res.ok) {
        setUser(null);
        return;
      }
      const users = await res.json();
      if (users.length > 0) {
        const loggedInUser = users[0];
        if (loggedInUser.isAdmin) {
          setRedirectPath(null);
        }
        setUser(loggedInUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
