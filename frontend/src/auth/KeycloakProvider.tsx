import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import keycloak from './keycloak';
import socket, { connectSocket } from '../api/socket';

interface KeycloakContextProps {
  keycloak: typeof keycloak | undefined;
  initialized: boolean;
  login: () => void;
  logout: () => void;
  isPremium: boolean;
}

const KeycloakContext = createContext<KeycloakContextProps>({
  keycloak: undefined,
  initialized: false,
  login: () => {},
  logout: () => {},
  isPremium: false
});

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const didInit = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      didInit.current = true;
      return;
    }

    if (keycloak.didInitalize) {
      didInit.current = true;
      return;
    }

    if (didInit.current === false) {
      didInit.current = true;
      console.log("Initializing Keycloak");
      keycloak
      .init({ onLoad: 'check-sso', pkceMethod: 'S256' })
      .then((authenticated: boolean) => {
        if (authenticated && keycloak.token) {
          connectSocket(keycloak.token);
        }
        didInit.current = true;
      }).catch((error: any) => {
        console.error("Keycloak initialization failed", error);
        didInit.current = false;
      })
    };

    const refreshInterval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak
          .updateToken(60)
          .then((refreshed: boolean) => {
            if (refreshed && keycloak.token) {
              socket.auth = { token: keycloak.token };
            }
          })
          .catch(() => keycloak.login());
      }
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, []);

  const roles = (keycloak.tokenParsed as any)?.realm_access?.roles;
  const value: KeycloakContextProps = {
    keycloak,
    initialized: didInit.current,
    login: () => {
      if (didInit.current && typeof keycloak.login === 'function') {
        console.log("Logging in with Keycloak redirect", `${window.location.origin}/tv`);
        keycloak.login({ redirectUri: `${window.location.origin}/authorizing` });
      } else {
        console.warn('Keycloak is not initialized yet.');
      }
    },
    logout: () => {
      if (didInit.current && typeof keycloak.logout === 'function') {
        keycloak.logout();
      } else {
        console.warn('Keycloak is not initialized yet.');
      }
    },
    isPremium: Array.isArray(roles) && roles.includes('premium')
  };

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => useContext(KeycloakContext);

export default KeycloakContext;
