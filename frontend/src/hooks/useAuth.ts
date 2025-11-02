"use client";

import { useState, useEffect, useCallback } from "react";
import { auth, LoginCredentials, UserProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      if (auth.isAuthenticated()) {
        const user = await auth.getProfile();
        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Failed to check authentication status",
      });
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await auth.login(credentials);

      if (response.success && response.data) {
        const user = response.data.user;
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user };
      } else {
        const errorMessage = response.error?.message || "Login failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    } catch {
      const errorMessage = "An unexpected error occurred during login";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      await auth.logout();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Redirect to login page
      router.push('/auth/signin');
    } catch {
      console.error('Logout error');
      // Even if logout fails, clear local state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push("/auth/signin");
    }
  }, [router]);

  const refreshProfile = useCallback(async () => {
    try {
      if (auth.isAuthenticated()) {
        const user = await auth.getProfile();
        setState((prev) => ({ ...prev, user, isAuthenticated: !!user }));
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    refreshProfile,
    clearError,
    checkAuthStatus,
  };
}

// Hook for protecting routes
export function useRequireAuth(redirectTo: string = "/auth/signin") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

// Hook for redirecting authenticated users away from auth pages
export function useRedirectIfAuthenticated(redirectTo: string = "/dashboard") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}
