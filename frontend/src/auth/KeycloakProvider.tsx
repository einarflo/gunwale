import { createContext, useContext, useEffect, useRef, ReactNode, useState, useMemo, useCallback } from 'react';
import keycloak from './keycloak';
import socket, { connectSocket } from '../api/socket';
import Loading from '../components/Loading';

interface KeycloakContextProps {
  keycloak: typeof keycloak | undefined;
  initialized: boolean;
  login: () => void;
  logout: () => void;
  isPremium: boolean;
  userId: string;
  username: string;
  isAuthenticated: boolean;
}

const KeycloakContext = createContext<KeycloakContextProps>({
  keycloak: undefined,
  initialized: false,
  login: () => {},
  logout: () => {},
  isPremium: false,
  userId: '',
  username: '',
  isAuthenticated: false,
});

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializedRef = useRef(false);

  // Memoize keycloak instance
  const memoKeycloak = useMemo(() => keycloak, []);

  // Memoize login/logout callbacks
  const loginCallback = useCallback(() => {
    if (isInitialized && typeof memoKeycloak.login === 'function') {
      console.log("Logging in with Keycloak redirect", `${window.location.origin}/tv`);
      memoKeycloak.login({ redirectUri: `${window.location.origin}/authorizing` });
    } else {
      console.warn('Keycloak is not initialized yet.');
    }
  }, [isInitialized, memoKeycloak]);

  const logoutCallback = useCallback(() => {
    if (isInitialized && typeof memoKeycloak.logout === 'function') {
      memoKeycloak.logout();
    } else {
      console.warn('Keycloak is not initialized yet.');
    }
  }, [isInitialized, memoKeycloak]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      console.log("Initializing Keycloak");
      memoKeycloak
        .init({ onLoad: 'check-sso', pkceMethod: 'S256' })
        .then((authenticated: boolean) => {
          if (authenticated && memoKeycloak.token) {
            connectSocket(memoKeycloak.token);
            console.log("Token:", memoKeycloak.tokenParsed);
          }
          setIsInitialized(true);
        }).catch((error: any) => {
          console.error("Keycloak initialization failed, retry in 15 sec", error);
          // retry initialization after a delay
          setTimeout(() => {
            window.location.reload();
          }, 15000);
        })
    }
    const refreshInterval = setInterval(() => {
      if (memoKeycloak.authenticated) {
        memoKeycloak
          .updateToken(60)
          .then((refreshed: boolean) => {
            if (refreshed && memoKeycloak.token) {
              socket.auth = { token: memoKeycloak.token };
            }
          })
          .catch(() => memoKeycloak.login());
      }
    }, 10000);
    return () => clearInterval(refreshInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roles = (memoKeycloak.tokenParsed as any)?.realm_access?.roles;
  const value: KeycloakContextProps = {
    keycloak: memoKeycloak,
    initialized: isInitialized,
    login: loginCallback,
    logout: logoutCallback,
    isPremium: Array.isArray(roles) && roles.includes('premium'),
    userId: memoKeycloak.tokenParsed?.sub || '',
    username: memoKeycloak.tokenParsed?.preferred_username || '',
    isAuthenticated: memoKeycloak.authenticated || false,
  };

  if (!isInitialized) {
    return <Loading />;
  }

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => useContext(KeycloakContext);

export default KeycloakContext;
