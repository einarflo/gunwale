import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../auth/KeycloakProvider";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { keycloak, username, userId, isPremium, logout } = useKeycloak();

  const tokenParsed = keycloak?.tokenParsed as any | undefined;

  const profile = useMemo(() => {
    if (!tokenParsed) return {} as any;
    const roles: string[] = tokenParsed?.realm_access?.roles || [];
    const resourceRoles = tokenParsed?.resource_access || {};
    const groups: string[] = tokenParsed?.groups || [];
    return {
      name: tokenParsed?.name || '',
      preferred_username: tokenParsed?.preferred_username || '',
      email: tokenParsed?.email || '',
      sub: tokenParsed?.sub || userId || '',
      roles,
      resourceRoles,
      groups,
      iat: tokenParsed?.iat ? new Date(tokenParsed.iat * 1000) : undefined,
      exp: tokenParsed?.exp ? new Date(tokenParsed.exp * 1000) : undefined,
      iss: tokenParsed?.iss,
      aud: tokenParsed?.aud,
      session_state: tokenParsed?.session_state,
    };
  }, [tokenParsed, userId]);

  const openAccount = async () => {
    try {
      await keycloak?.accountManagement();
    } catch (e) {
      // Fallback: open known account URL
      const realm = (keycloak as any)?.realm || 'Tavl';
      const base = (keycloak as any)?.authServerUrl || 'https://auth.tavl.no';
      window.open(`${base.replace(/\/$/, '')}/realms/${realm}/account`, '_blank');
    }
  };

  const requestDelete = async () => {
    const confirmed = window.confirm('Er du sikker på at du vil slette kontoen din? Dette kan ikke angres. Du vil bli sendt til kontosiden for å fullføre slettingen.');
    if (!confirmed) return;
    await openAccount();
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6">
        <div className="text-3xl font-extrabold text-blue-800">Profil</div>
        <div className="text-gray-600">Administrer kontoen din og abonnement</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile summary */}
        <div className="md:col-span-1 rounded-2xl bg-white/90 shadow p-6 border-2 border-blue-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center text-2xl font-bold">
              {(profile.name || username || 'U')[0]?.toUpperCase?.()}
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{profile.name || username}</div>
              {profile.email && <div className="text-gray-600">{profile.email}</div>}
              <div className="text-xs text-gray-500 mt-1">Bruker-ID: {profile.sub}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button onClick={openAccount} className="rounded-xl bg-white px-4 py-2 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">Kontoinnstillinger</button>
            <button onClick={logout} className="rounded-xl bg-white px-4 py-2 text-gray-700 font-semibold shadow border-2 border-gray-200 hover:bg-gray-50 transition">Logg ut</button>
            <button onClick={requestDelete} className="rounded-xl bg-white px-4 py-2 text-red-600 font-semibold shadow border-2 border-red-200 hover:bg-red-50 transition">Slett konto</button>
          </div>
        </div>

        {/* Subscription card */}
        <div className="md:col-span-2 rounded-2xl bg-white/90 shadow p-6 border-2 border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">Abonnement</div>
              <div className="text-gray-600">Status og fordeler</div>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${isPremium ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
              {isPremium ? 'Premium' : 'Gratis'}
            </span>
          </div>
          <div className="mt-4 text-gray-700">
            {isPremium ? (
              <>
                Du har Premium. Nyt annonsefri opplevelse og eksklusive funksjoner.
              </>
            ) : (
              <>
                Du er på Gratis. Oppgrader for å få flere funksjoner og ingen annonser.
              </>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            {!isPremium && (
              <button onClick={() => navigate('/')} className="rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-2 text-white font-bold shadow hover:scale-105 transition">Start Premium</button>
            )}
            <button onClick={() => navigate('/')} className="rounded-xl bg-white px-5 py-2 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">Se planer</button>
          </div>
        </div>

        {/* Keycloak details */}
        <div className="md:col-span-3 rounded-2xl bg-white/90 shadow p-6 border-2 border-pink-100">
          <div className="text-xl font-bold text-gray-900 mb-3">Kontodetaljer (Keycloak)</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Navn</div>
              <div className="font-semibold">{profile.name || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Brukernavn</div>
              <div className="font-semibold">{profile.preferred_username || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">E-post</div>
              <div className="font-semibold">{profile.email || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Roller</div>
              <div className="font-semibold break-words">{(profile.roles || []).join(', ') || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Grupper</div>
              <div className="font-semibold break-words">{(profile.groups || []).join(', ') || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Utsteder (iss)</div>
              <div className="font-semibold break-words">{profile.iss || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Audience (aud)</div>
              <div className="font-semibold break-words">{Array.isArray(profile.aud) ? profile.aud.join(', ') : (profile.aud || '—')}</div>
            </div>
            <div>
              <div className="text-gray-500">Issued</div>
              <div className="font-semibold">{profile.iat ? profile.iat.toLocaleString() : '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Expires</div>
              <div className="font-semibold">{profile.exp ? profile.exp.toLocaleString() : '—'}</div>
            </div>
            <div className="md:col-span-3">
              <div className="text-gray-500">Ressurs-roller</div>
              <pre className="mt-1 whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-3 border border-gray-200 text-xs">{JSON.stringify(profile.resourceRoles || {}, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
