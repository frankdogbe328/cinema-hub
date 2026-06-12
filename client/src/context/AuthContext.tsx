import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getStoredToken, setStoredToken } from "@/lib/api";
import type { AuthResponse, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; username: string; password: string }) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!getStoredToken());

  const persist = useCallback((res: AuthResponse) => {
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ user: User }>("/users/profile");
      setUser(data.user);
    } catch {
      setStoredToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
      persist(data);
    },
    [persist]
  );

  const register = useCallback(
    async (payload: { email: string; username: string; password: string }) => {
      await api.post("/auth/register", payload);
    },
    []
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      const { data } = await api.post<AuthResponse>("/auth/verify-otp", { email, otp });
      persist(data);
    },
    [persist]
  );

  const resendOtp = useCallback(async (email: string) => {
    await api.post("/auth/resend-otp", { email });
  }, []);

  const googleLogin = useCallback(
    async (credential: string) => {
      const { data } = await api.post<AuthResponse>("/auth/google", { credential });
      persist(data);
    },
    [persist]
  );

  const forgotPassword = useCallback(async (email: string) => {
    await api.post("/auth/forgot-password", { email });
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await api.post("/auth/reset-password", { token, password });
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      verifyOtp,
      resendOtp,
      googleLogin,
      forgotPassword,
      resetPassword,
      refreshUser,
      logout,
    }),
    [user, token, loading, login, register, verifyOtp, resendOtp, googleLogin, forgotPassword, resetPassword, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
