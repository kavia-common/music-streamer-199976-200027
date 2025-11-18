import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { storage } from '../utils/storage';
import { createApiClient } from '../lib/apiClient';
import { createWsClient } from '../lib/wsClient';
import { getFeatureFlags, experimentsEnabled } from '../lib/config';

// Keys for persisted auth
const AUTH_STORAGE_KEY = 'auth.state.v1';

// Shape of persisted auth
function loadPersistedAuth() {
  const data = storage.getJson(AUTH_STORAGE_KEY, null);
  if (!data || typeof data !== 'object') return { token: undefined, user: undefined };
  return {
    token: data.token,
    user: data.user,
  };
}

function savePersistedAuth({ token, user }) {
  storage.setJson(AUTH_STORAGE_KEY, { token, user });
}

/**
 * PUBLIC_INTERFACE
 * AuthContext: React context providing authentication state and API/WS clients.
 * Value contains:
 * - user: object | undefined
 * - token: string | undefined
 * - isAuthenticated: boolean
 * - login: (token: string, user?: object) => void
 * - logout: () => void
 * - updateUser: (nextUser: object | ((prev)=>object)) => void
 * - api: ApiClient instance (auto-injects token)
 * - ws: function connect(path, protocols?) to open a token-aware WebSocket
 * - featureFlags: object map of feature flags
 * - experimentsEnabled: boolean flag
 */
export const AuthContext = createContext(undefined);

/**
 * PUBLIC_INTERFACE
 * AuthProvider: Wrap your app with this provider to access auth state via useAuth().
 */
export function AuthProvider({ children }) {
  const persisted = useMemo(loadPersistedAuth, []);
  const [token, setToken] = useState(persisted.token);
  const [user, setUser] = useState(persisted.user);

  // Keep persistence in sync
  useEffect(() => {
    savePersistedAuth({ token, user });
  }, [token, user]);

  const getToken = useCallback(() => token, [token]);

  // Shared API client that reads token lazily
  const api = useMemo(() => createApiClient(getToken), [getToken]);

  // WS: expose a small wrapper to create connections on demand
  const wsClient = useMemo(() => createWsClient(getToken, 'query'), [getToken]);
  const ws = useCallback((path, protocols) => wsClient.connect(path, protocols), [wsClient]);

  const login = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    if (nextUser !== undefined) setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    setToken(undefined);
    setUser(undefined);
  }, []);

  const updateUser = useCallback((next) => {
    setUser((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      logout,
      updateUser,
      api,
      ws,
      featureFlags: getFeatureFlags(),
      experimentsEnabled: experimentsEnabled(),
    }),
    [user, token, login, logout, updateUser, api, ws]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
