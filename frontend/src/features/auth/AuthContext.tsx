
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "../../lib/api";
import type { AuthResponse, AuthUser } from "./auth.api";

type RefreshResponse = {
  success: boolean;
  message: string;
  accessToken: string;
};

type CurrentUserResponse = {
  success: boolean;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  login: (result: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

// Prevent duplicate refresh requests during React Strict Mode development checks.
let restorePromise: Promise<{
  accessToken: string;
  user: AuthUser;
} | null> | null = null;

// AuthContext.tsx
function restoreSession() {
  if (!restorePromise) {
    restorePromise = (async () => {
      // 1. Refresh to get a new short-lived access token via httpOnly cookie
      const refreshResult = await apiRequest<RefreshResponse>(
        "/auth/refresh",
        { method: "POST" },
      );

      // 2. Pass authorization header inside options (2nd parameter)
      const userResult = await apiRequest<CurrentUserResponse>(
        "/users/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${refreshResult.accessToken}`,
          },
        },
      );

      return {
        accessToken: refreshResult.accessToken,
        user: userResult.user,
      };
    })()
      .catch((err) => {
        console.error("Session restoration failed:", err);
        return null;
      })
      .finally(() => {
        restorePromise = null;
      });
  }

  return restorePromise;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    restoreSession().then((session) => {
      if (!isMounted) return;

      if (session) {
        setUser(session.user);
        setAccessToken(session.accessToken);
      }

      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function login(result: AuthResponse) {
    setUser(result.user);
    setAccessToken(result.accessToken);
    setIsAuthLoading(false);
  }

  async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Failed to log out from backend:", error);
  } finally {
    setUser(null);
    setAccessToken(null);
  }
}

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthLoading,
      login,
      logout,
    }),
    [user, accessToken, isAuthLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
