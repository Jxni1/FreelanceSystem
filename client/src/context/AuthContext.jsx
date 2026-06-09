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

async function fetchAndStorePermissions(accessToken) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/my-permissions`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.permissions) {
        localStorage.setItem('userPermissions', JSON.stringify(data.permissions));
      }
      if (data.roles) {
        localStorage.setItem('userRoles', JSON.stringify(data.roles));
      }
    }
  } catch (error) {
    console.error('Failed to fetch permissions:', error);
  }
}

// ✅ Synchronously initialize auth state from localStorage
function initializeAuthState() {
  try {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      return { user: null, accessToken: null };
    }

    const decodedUser = buildAuthUser(storedToken);
    
    // Check if token is still valid
    if (decodedUser && decodedUser.tokenExpiry > new Date()) {
      return { user: decodedUser, accessToken: storedToken };
    }
  } catch (error) {
    console.error('Error initializing auth from localStorage:', error);
  }

  return { user: null, accessToken: null };
}

export function AuthProvider({ children }) {
  // ✅ Initialize state synchronously from localStorage BEFORE render
  const initialAuthState = initializeAuthState();
  const [user, setUser] = useState(initialAuthState.user);
  const [accessToken, setAccessToken] = useState(initialAuthState.accessToken);
  const [isLoading, setIsLoading] = useState(!initialAuthState.user); // Only loading if no initial user

  const accessTokenRef = useRef(initialAuthState.accessToken);
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
          localStorage.removeItem('userPermissions');
          localStorage.removeItem('userRoles');
          localStorage.removeItem('accessToken');
          window.dispatchEvent(new CustomEvent('auth:theft-detected'));
          return null;
        }

        if (!data.success || !data.accessToken) {
          setUser(null);
          setAccessToken(null);
          accessTokenRef.current = null;
          localStorage.removeItem('userPermissions');
          localStorage.removeItem('userRoles');
          localStorage.removeItem('accessToken');
          return null;
        }

        const newUser = buildAuthUser(data.accessToken);
        setUser(newUser);
        setAccessToken(data.accessToken);
        accessTokenRef.current = data.accessToken;
        localStorage.setItem('accessToken', data.accessToken);
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

  // ✅ Background refresh after initial state is set from localStorage
  useEffect(() => {
    const performBackgroundRefresh = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedToken) {
          const decodedUser = buildAuthUser(storedToken);
          
          // If token has expired, refresh it
          if (!decodedUser || decodedUser.tokenExpiry <= new Date()) {
            await refreshTokens();
          } else {
            // Token still valid, just schedule the next refresh
            scheduleRefresh(decodedUser.tokenExpiry);
          }
        } else {
         
          await refreshTokens();
        }
      } catch (error) {
        console.error('Background refresh error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performBackgroundRefresh();
  }, []);

  const login = useCallback(
    async (email, password) => {
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

        
        localStorage.setItem('accessToken', data.accessToken);

        await fetchAndStorePermissions(data.accessToken);
        scheduleRefresh(newUser.tokenExpiry);
      }

      return data;
    },
    [refreshTokens, scheduleRefresh]
  );

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    accessTokenRef.current = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('userRoles');
    if (silentRefreshTimer.current) clearTimeout(silentRefreshTimer.current);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}