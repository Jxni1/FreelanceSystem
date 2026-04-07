import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { buildAuthUser } from '../lib/jwt';
import { configureApiClient } from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const accessTokenRef = useRef(null);
  const refreshPromiseRef = useRef(null);
  const silentRefreshTimer = useRef(null);

  const scheduleRefresh = useCallback((tokenExpiry) => {
    if (silentRefreshTimer.current) clearTimeout(silentRefreshTimer.current);
    const msUntilRefresh = tokenExpiry.getTime() - Date.now() - 90_000;
    if (msUntilRefresh > 0) {
      silentRefreshTimer.current = setTimeout(() => refreshTokens(), msUntilRefresh);
    }
  }, []);

  const refreshTokens = useCallback(() => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();

        if (data.isTheftDetected) {
          setUser(null);
          setAccessToken(null);
          accessTokenRef.current = null;
          window.dispatchEvent(new CustomEvent('auth:theft-detected'));
          return null;
        }

        if (!data.success || !data.accessToken) {
          setUser(null);
          setAccessToken(null);
          accessTokenRef.current = null;
          return null;
        }

        const newUser = buildAuthUser(data.accessToken);
        setUser(newUser);
        setAccessToken(data.accessToken);
        accessTokenRef.current = data.accessToken;
        configureApiClient(data.accessToken, refreshTokens);

        if (newUser) scheduleRefresh(newUser.tokenExpiry);
        return data.accessToken;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [scheduleRefresh]);

  useEffect(() => {
    configureApiClient(accessToken, refreshTokens);
  }, [accessToken, refreshTokens]);

  useEffect(() => {
    refreshTokens().finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success && data.accessToken) {
      const newUser = buildAuthUser(data.accessToken);
      setUser(newUser);
      setAccessToken(data.accessToken);
      accessTokenRef.current = data.accessToken;
      configureApiClient(data.accessToken, refreshTokens);
      if (newUser) scheduleRefresh(newUser.tokenExpiry);
    }

    return data;
  }, [scheduleRefresh, refreshTokens]);

  const logout = useCallback(async () => {
    if (silentRefreshTimer.current) clearTimeout(silentRefreshTimer.current);
    setUser(null);
    setAccessToken(null);
    accessTokenRef.current = null;
    configureApiClient(null, refreshTokens);

    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/revoke`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => null);
  }, [refreshTokens]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
