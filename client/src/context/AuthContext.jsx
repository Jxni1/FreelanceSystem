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
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const accessTokenRef = useRef(null);
  const refreshPromiseRef = useRef(null);
  const silentRefreshTimer = useRef(null);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setPermissions([]);
    setRoles([]);
    accessTokenRef.current = null;
  }, []);

  const loadPermissions = useCallback(async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/my-permissions`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
      setRoles(Array.isArray(data.roles) ? data.roles : []);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  }, []);

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
          clearAuthState();
          window.dispatchEvent(new CustomEvent('auth:theft-detected'));
          return null;
        }

        if (!data.success || !data.accessToken) {
          clearAuthState();
          return null;
        }

        const newUser = buildAuthUser(data.accessToken);
        setUser(newUser);
        setAccessToken(data.accessToken);
        accessTokenRef.current = data.accessToken;
        configureApiClient(data.accessToken, refreshTokens);
        await loadPermissions(data.accessToken);

        if (newUser) scheduleRefresh(newUser.tokenExpiry);
        return data.accessToken;
      } catch {
        clearAuthState();
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [scheduleRefresh, clearAuthState, loadPermissions]);

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

    if (!data.success || !data.accessToken) {
      return { success: false, error: data.errors?.[0] ?? 'Invalid email or password.' };
    }

    const newUser = buildAuthUser(data.accessToken);
    setUser(newUser);
    setAccessToken(data.accessToken);
    accessTokenRef.current = data.accessToken;
    configureApiClient(data.accessToken, refreshTokens);
    await loadPermissions(data.accessToken);
    if (newUser) scheduleRefresh(newUser.tokenExpiry);

    return { success: true, user: newUser };
  }, [scheduleRefresh, refreshTokens, loadPermissions]);

  const logout = useCallback(async () => {
    if (silentRefreshTimer.current) clearTimeout(silentRefreshTimer.current);
    clearAuthState();
    configureApiClient(null, refreshTokens);

    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/revoke`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => null);
  }, [clearAuthState, refreshTokens]);

  const refreshPermissions = useCallback(async () => {
    if (accessTokenRef.current) {
      await loadPermissions(accessTokenRef.current);
    }
  }, [loadPermissions]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        permissions,
        roles,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshTokens,
        refreshPermissions,
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
