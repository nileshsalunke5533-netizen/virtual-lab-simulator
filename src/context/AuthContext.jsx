import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiRequest, clearAuthToken, getAuthToken, saveAuthToken } from "../services/api";
import { AuthContext, useAuth } from "./auth.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAuthToken()));
  const [authError, setAuthError] = useState("");

  const refreshUser = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setAuthError("");
    try {
      const { user: authenticatedUser } = await apiRequest("/auth/me");
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (error) {
      if (error.status === 401 || error.status === 403) clearAuthToken();
      setUser(null);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve()
      .then(() => refreshUser())
      .catch(() => {});
  }, [refreshUser]);

  const signIn = useCallback(async (token) => {
    saveAuthToken(token);
    setAuthError("");
    try {
      return await refreshUser();
    } catch (error) {
      clearAuthToken();
      setUser(null);
      setAuthError("");
      throw error;
    }
  }, [refreshUser]);

  const signOut = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setAuthError("");
  }, []);

  const value = useMemo(
    () => ({ user, loading, authError, signIn, signOut, refreshUser }),
    [user, loading, authError, signIn, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ role, children }) {
  const { user, loading, authError, refreshUser } = useAuth();
  const location = useLocation();

  if (loading) return <p role="status">Checking your session…</p>;
  if (!user && authError && getAuthToken()) {
    return (
      <div role="alert">
        <p>{authError}</p>
        <button type="button" onClick={() => refreshUser().catch(() => {})}>
          Retry
        </button>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace state={{ from: location }} />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "faculty" ? "/faculty-dashboard" : "/dashboard"} replace />;
  }
  return children;
}
