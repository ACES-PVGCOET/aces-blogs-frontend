"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { apiClient, getStoredToken, setStoredToken } from "@/lib/api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  profileImg: string | null;
  linkedIn: string | null;
  role: "READER" | "WRITER" | "REVIEWER" | "ADMIN" | string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (dto: {
    bio?: string;
    profileImg?: string;
    linkedIn?: string;
  }) => Promise<void>;
  isAdmin: boolean;
  isWriter: boolean;
  isReviewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const profile = await apiClient.auth.getMe();
      setUser(profile);
      setToken(currentToken);
    } catch (err) {
      console.warn("Failed to restore session:", err);
      setStoredToken(null);
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const currentToken = getStoredToken();
      if (!currentToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const profile = await apiClient.auth.getMe();
        if (isMounted) {
          setUser(profile);
          setToken(currentToken);
        }
      } catch (err) {
        console.warn("Failed to initialize session:", err);
        setStoredToken(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.login(email, password);
      setUser(res.user);
      setToken(res.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.auth.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (dto: {
    bio?: string;
    profileImg?: string;
    linkedIn?: string;
  }) => {
    const updated = await apiClient.users.updateMe(dto);
    setUser((prev) => (prev ? { ...prev, ...updated } : updated));
  };

  const isAdmin = user?.role === "ADMIN";
  const isWriter = user?.role === "WRITER" || isAdmin;
  const isReviewer = user?.role === "REVIEWER" || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        updateProfile,
        isAdmin,
        isWriter,
        isReviewer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
