import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import keycloak from './keycloak';
import socket, { connectSocket } from '../api/socket';

interface KeycloakContextProps {
  keycloak: typeof keycloak | undefined;
  initialized: boolean;
  login: () => void;
  logout: () => void;
}

const KeycloakContext = createContext<KeycloakContextProps>({
  keycloak: undefined,
  initialized: false,
  login: () => {},
  logout: () => {}
});

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setInitialized(true);
      return;
    }

    keycloak
      .init({ onLoad: 'check-sso', pkceMethod: 'S256' })
      .then((authenticated: boolean) => {
        if (authenticated && keycloak.token) {
          connectSocket(keycloak.token);
        }
        setInitialized(true);
      });

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

  const value: KeycloakContextProps = {
    keycloak,
    initialized,
    login: () => keycloak.login(),
    logout: () => keycloak.logout()
  };

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => useContext(KeycloakContext);

export default KeycloakContext;
