import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { clearSession, getSession, saveSession } from "./session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  const login = useCallback((nextSession) => {
    saveSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("auction:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auction:unauthorized", handleUnauthorized);
  }, [logout]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      token: session?.token ?? null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
