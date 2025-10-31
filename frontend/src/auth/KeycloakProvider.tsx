import { createContext, useContext, useEffect, useRef, ReactNode, useState, useMemo, useCallback } from 'react';
import keycloak from './keycloak';
import socket, { connectSocket } from '../api/socket';
import Loading from '../components/Loading';
import { get } from '../api';

export interface TavlUserProfile {
  userId: string;
  username: string;
  preferredUsername: string | null;
  email: string | null;
  name: string | null;
  level: number;
  xp: number;
  totalPoints: number;
  playedQuizzes: number;
  createdQuizzes: number;
  memberSince: string;
  premiumSince: string | null;
  isPremium: boolean;
  lastActiveAt: string | null;
  updatedAt: string;
}

interface KeycloakContextProps {
  keycloak: typeof keycloak | undefined;
  initialized: boolean;
  login: () => void;
  logout: () => void;
  isPremium: boolean;
  userId: string;
  username: string;
  isAuthenticated: boolean;
  profile: TavlUserProfile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
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
  profile: null,
  profileLoading: false,
  refreshProfile: async () => {},
});

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<TavlUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const initializedRef = useRef(false);

  // Memoize keycloak instance
  const memoKeycloak = useMemo(() => keycloak, []);

  const loadProfile = useCallback(async () => {
    if (!memoKeycloak.authenticated || !memoKeycloak.token) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const res = await get<TavlUserProfile>('/users/me');
      setProfile(res.data);
    } catch (error) {
      console.error('Failed to load user profile', error);
    } finally {
      setProfileLoading(false);
    }
  }, [memoKeycloak]);

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
      memoKeycloak.logout({ redirectUri: `${window.location.origin}` });
    } else {
      console.warn('Keycloak is not initialized yet.');
    }
  }, [isInitialized, memoKeycloak]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      console.log("Initializing Keycloak");
      memoKeycloak.onAuthSuccess = () => {
        console.log("Keycloak auth success");
        setIsAuthenticated(true);
        if (memoKeycloak.token) {
          connectSocket(memoKeycloak.token);
          socket.auth = { token: memoKeycloak.token };
          loadProfile();
        }
      };
      memoKeycloak.onAuthRefreshSuccess = () => {
        console.log("Keycloak token refresh success");
        setIsAuthenticated(true);
        if (memoKeycloak.token) {
          socket.auth = { token: memoKeycloak.token };
          loadProfile();
        }
      };
      memoKeycloak.onAuthLogout = () => {
        console.log("Keycloak logout");
        setIsAuthenticated(false);
        setProfile(null);
        setProfileLoading(false);
      };
      memoKeycloak
        .init({ onLoad: 'check-sso', pkceMethod: 'S256' })
        .then((authenticated: boolean) => {
          setIsAuthenticated(authenticated);
          if (authenticated && memoKeycloak.token) {
            connectSocket(memoKeycloak.token);
            console.log("Token:", memoKeycloak.tokenParsed);
            loadProfile();
          } else {
            setProfile(null);
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
            setIsAuthenticated(memoKeycloak.authenticated ?? refreshed);
            if (refreshed && memoKeycloak.token) {
              socket.auth = { token: memoKeycloak.token };
              loadProfile();
            }
          })
          .catch(() => memoKeycloak.login());
      }
    }, 10000);
    return () => clearInterval(refreshInterval);
  }, [memoKeycloak, loadProfile]);

  const roles = (memoKeycloak.tokenParsed as any)?.realm_access?.roles;
  const resolvedUserId = profile?.userId || memoKeycloak.tokenParsed?.sub || '';
  const resolvedUsername = profile?.username || memoKeycloak.tokenParsed?.preferred_username || '';
  const premiumFromToken = Array.isArray(roles) && roles.includes('premium');
  const resolvedPremium = profile?.isPremium ?? premiumFromToken;

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const value: KeycloakContextProps = {
    keycloak: memoKeycloak,
    initialized: isInitialized,
    login: loginCallback,
    logout: logoutCallback,
    isPremium: resolvedPremium,
    userId: resolvedUserId,
    username: resolvedUsername,
    isAuthenticated: isAuthenticated,
    profile,
    profileLoading,
    refreshProfile,
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
