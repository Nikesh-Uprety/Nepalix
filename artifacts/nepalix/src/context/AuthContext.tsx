import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { ApiError, api, storeSessionToken, clearSessionToken, type AuthStore, type AuthUser, type RegisterStartResult } from "@/lib/api";

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleAuthError: boolean;
  clearGoogleAuthError: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<RegisterStartResult>;
  verifyRegistration: (data: { email: string; code: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  listStores: () => Promise<AuthStore[]>;
  setActiveStore: (storeId: string) => Promise<AuthUser>;
  startImpersonation: (userId: string, storeId?: string) => Promise<AuthUser>;
  stopImpersonation: () => Promise<AuthUser>;
  completeOnboarding: (data: Parameters<typeof api.auth.completeOnboarding>[0]) => Promise<{
    user: AuthUser;
    store: { id: string; slug: string; name: string };
    page: { id: string; slug: string; isPublished: boolean };
    generatedProductId: string;
  }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleAuthError, setGoogleAuthError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleAuth = params.get("google_auth");
    const urlToken = params.get("token");
    if (googleAuth || urlToken) {
      window.history.replaceState({}, "", window.location.pathname);
      if (googleAuth === "error") setGoogleAuthError(true);
    }
    if (urlToken) storeSessionToken(urlToken);
    api.auth
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await api.auth.login({ email, password });
    storeSessionToken(token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      return api.auth.register(data);
    },
    []
  );

  const verifyRegistration = useCallback(
    async (data: { email: string; code: string }) => {
      const { user, token } = await api.auth.verifyRegistration(data);
      storeSessionToken(token);
      setUser(user);
      return user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      // Expired or already-cleared sessions should still leave the client logged out.
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    }
    clearSessionToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api.auth.me();
      setUser(user);
      return user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const listStores = useCallback(async () => {
    const { stores } = await api.auth.stores();
    return stores;
  }, []);

  const setActiveStore = useCallback(async (storeId: string) => {
    const { user } = await api.auth.setActiveStore(storeId);
    setUser(user);
    return user;
  }, []);

  const startImpersonation = useCallback(async (userId: string, storeId?: string) => {
    const { user } = await api.auth.startImpersonation({ userId, storeId });
    setUser(user);
    return user;
  }, []);

  const stopImpersonation = useCallback(async () => {
    const { user } = await api.auth.stopImpersonation();
    setUser(user);
    return user;
  }, []);

  const completeOnboarding = useCallback(
    async (data: Parameters<typeof api.auth.completeOnboarding>[0]) => {
      const result = await api.auth.completeOnboarding(data);
      setUser(result.user);
      return result;
    },
    []
  );

  const clearGoogleAuthError = useCallback(() => setGoogleAuthError(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        googleAuthError,
        clearGoogleAuthError,
        login,
        register,
        verifyRegistration,
        logout,
        refreshUser,
        listStores,
        setActiveStore,
        startImpersonation,
        stopImpersonation,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
