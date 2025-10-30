import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../auth/KeycloakProvider";
import { useI18n } from "../i18n/I18nProvider";
import { post } from "../api";
import GlobalStyles from "../components/landing/GlobalStyles";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { keycloak, username, userId, isPremium, logout } = useKeycloak();
  const { t } = useI18n();
  const [portalLoading, setPortalLoading] = useState(false);

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
    const confirmed = window.confirm(t('profile.deleteConfirm'));
    if (!confirmed) return;
    await openAccount();
  };

  const openPortal = useCallback(async () => {
    try {
      setPortalLoading(true);
      const returnUrl = `${window.location.origin}/home/profile`;
      const cancelUrl = `${window.location.origin}/home/profile`;
      const res = await post(`/billing/create-portal-session`, { return_url: returnUrl, cancel_url: cancelUrl });
      const url = (res.data as any)?.url || (res.data as any)?.session?.url;
      if (url) {
        window.location.href = url;
      } else {
        alert(t('billing.error') || 'Could not open billing portal');
      }
    } catch (e) {
      alert(t('billing.error') || 'Could not open billing portal');
    } finally {
      setPortalLoading(false);
    }
  }, [t]);

  const displayName =
    profile.name ||
    username ||
    profile.preferred_username ||
    (profile.email ? profile.email.split("@")[0] : "") ||
    "";
  const avatarLetter = (displayName?.trim?.()[0] || "U").toUpperCase();
  const detailItems = [
    { label: t("profile.details.name"), value: profile.name || "—" },
    { label: t("profile.details.username"), value: profile.preferred_username || "—" },
    { label: t("profile.details.email"), value: profile.email || "—" },
    {
      label: t("profile.details.roles"),
      value: (profile.roles || []).length ? (profile.roles || []).join(", ") : "—",
    },
    {
      label: t("profile.details.groups"),
      value: (profile.groups || []).length ? (profile.groups || []).join(", ") : "—",
    },
    { label: t("profile.details.issuer"), value: profile.iss || "—" },
    {
      label: t("profile.details.audience"),
      value: Array.isArray(profile.aud) ? profile.aud.join(", ") : profile.aud || "—",
    },
    { label: t("profile.details.issued"), value: profile.iat ? profile.iat.toLocaleString() : "—" },
    { label: t("profile.details.expires"), value: profile.exp ? profile.exp.toLocaleString() : "—" },
  ];

  return (
    <div
      className="relative min-h-screen bg-[#1e1b4b] text-white overflow-hidden"
      style={{
        fontFamily:
          'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <GlobalStyles />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse-slow" />
      <ParallaxOrbs />
      <ParallaxScroll />

      <div className="relative z-10 pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6 space-y-10">
          { /* <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-white/50">
                {t("profile.title") || "Profil"}
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
                {displayName || t("profile.title")}
              </h1>
              <p className="text-white/70 max-w-2xl">{t("profile.subtitle")}</p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white/85 shadow-lg shadow-indigo-900/20 backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-pink-500/80 text-xs font-bold text-white">
                {avatarLetter}
              </span>
              <div className="flex items-center gap-2">
                <span>{isPremium ? t("profile.subscription.premium") : t("profile.subscription.free")}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
              </div>
            </div>
          </header> */}

          <div className="grid gap-6 lg:grid-cols-[1.55fr,1fr] mt-10">
            <section className="rounded-3xl border border-white/10 bg-white/8 p-6 sm:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
                <div className="relative">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-br from-indigo-400/80 via-purple-500/80 to-pink-500/80 flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-purple-900/40 border border-white/20">
                    {avatarLetter}
                  </div>
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  <p className="text-[13px] uppercase tracking-[0.2em] text-white/50">
                    {t("profile.subscription.subtitle")}
                  </p>
                  <p className="text-2xl font-bold text-white/95">{displayName || t("profile.details.name")}</p>
                  <p className="text-white/70">{profile.email || t("profile.details.email")}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(profile.groups || []).slice(0, 3).map((group: string) => (
                      <span
                        key={group}
                        className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70 backdrop-blur"
                      >
                        {group}
                      </span>
                    ))}
                    {(profile.groups || []).length > 3 && (
                      <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/60">
                        +{(profile.groups || []).length - 3} {t("profile.details.groups")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-center shadow-inner shadow-indigo-900/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">{t("profile.details.roles")}</p>
                  <p className="mt-2 text-2xl font-bold text-white/90">{(profile.roles || []).length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-center shadow-inner shadow-indigo-900/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">{t("profile.details.groups")}</p>
                  <p className="mt-2 text-2xl font-bold text-white/90">{(profile.groups || []).length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-center shadow-inner shadow-indigo-900/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {t("profile.details.issued")}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white/85">
                    {profile.iat ? profile.iat.toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <button
                  onClick={openAccount}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition shadow-lg shadow-indigo-900/25"
                >
                  <span>{t("profile.accountSettings")}</span>
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
                </button>
                <button
                  onClick={logout}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/14 transition shadow-lg shadow-indigo-900/20"
                >
                  <span>{t("profile.signOut")}</span>
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button
                  onClick={requestDelete}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-500/20 px-4 py-3 text-sm font-semibold text-rose-50 hover:bg-rose-500/30 transition shadow-lg shadow-rose-900/25"
                >
                  <span>{t("profile.delete")}</span>
                  <span aria-hidden className="transition-transform group-hover:-translate-y-0.5">⚠</span>
                </button>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-500/25 via-purple-500/25 to-pink-500/25 p-6 sm:p-8 shadow-[0_18px_60px_rgba(76,29,149,0.35)] backdrop-blur-xl">
              <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_20%_-10%,rgba(255,255,255,0.35)_0%,transparent_55%)]" />
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">{t("profile.subscription")}</h2>
                  <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                    {isPremium ? t("profile.subscription.premium") : t("profile.subscription.free")}
                  </span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {isPremium ? t("profile.subscription.premiumDesc") : t("profile.subscription.freeDesc")}
                </p>

                <div className="mt-4 grid gap-3">
                  {!isPremium && (
                    <button
                      onClick={() => navigate("/purchase")}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/40"
                    >
                      {t("profile.subscription.startPremium")}
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/home/upgrades")}
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/20"
                  >
                    {t("profile.subscription.seePlans")}
                  </button>
                  {isPremium && (
                    <button
                      onClick={openPortal}
                      disabled={portalLoading}
                      className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {portalLoading
                        ? t("billing.loading") || "Loading…"
                        : t("billing.manage") || "Manage subscription"}
                    </button>
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/80">
                  <p className="font-semibold uppercase tracking-[0.2em] text-[11px] text-white/60">
                    {t("profile.subscription.subtitle")}
                  </p>
                  <p className="mt-2 leading-relaxed">
                    {t("profile.subscription.note") ||
                      "Administrer fakturaopplysninger, se kvitteringer og oppdater planene dine."}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-white/10 bg-white/6 p-6 sm:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.32)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{t("profile.details.title")}</h2>
                <p className="text-sm text-white/60">
                  {t("profile.details.subtitle") ||
                    "Tekniske detaljer fra Keycloak for støtte og feilsøking."}
                </p>
              </div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                {t("profile.userId")}: {profile.sub || "—"}
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {detailItems.map(({ label, value }) => (
                <div
                  key={label as string}
                  className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-white/80 shadow-inner shadow-indigo-900/15 backdrop-blur"
                >
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</dt>
                  <dd className="mt-2 break-words text-white">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                {t("profile.details.resourceRoles")}
              </p>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-emerald-100 shadow-inner shadow-black/40 backdrop-blur">
                {JSON.stringify(profile.resourceRoles || {}, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
