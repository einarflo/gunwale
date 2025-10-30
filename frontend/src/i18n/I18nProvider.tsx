import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'nb';

type Dict = Record<string, string>;
type Bundle = Record<Lang, Dict>;

const bundles: Bundle = {
  en: {
    // Common
    'common.pts': 'pts',
    'common.back': 'Back',
    'common.begin': 'Begin',
    'common.next': 'Next',
    'common.exit': 'Exit',
    'common.current': 'Current',
    'common.join': 'Join',
    'common.joinAnother': 'Join another game',
    'common.loading': 'Loading…',
    'loading.title': 'Loading…',
    'loading.subtitle': 'Syncing your account and game data',
    'loading.hint': 'Hang tight while we prepare everything for you.',
    'auth.authorizing': 'Authorizing…',
    'auth.subtitle': 'Verifying your Tavl session',
    'auth.hint': 'You will be redirected automatically.',
    'game.over': 'Well played!',
    'game.placement': 'You placed {{rank}}/{{total}}',
    'game.placement.pending': 'Calculating placement...',
    'tv.home.loading': 'Loading your games…',
    'tutorial.backToLobby': 'Back to lobby',
    'waiting.selectColor': 'Select your color',
    // Header
    'header.join': 'Join game',
    'header.signin': 'Sign in',
    'header.signout': 'Sign out',
    'header.featured': 'Featured',
    'header.about': 'About',
    'header.upgrades': 'Upgrades',
    'header.pricing': 'Pricing',
    'header.library': 'Library',
    'header.profile': 'Edit profile',
    'header.language': 'Language',
    // Home
    'home.create': 'New quiz',
    'home.discover': 'Discover',
    'tv.scoreboard': 'Scoreboard',
    'tv.podium.title': 'Winners!',
    'common.finish': 'Finish',
    'join.title': 'Got a game pin?',
    'join.subtitle': 'Enter your game pin to join an existing game.',
    'join.placeholder': 'Game pin…',
    'join.label': 'Game pin',
    'join.errorMissing': 'Please enter a game pin',
    'join.errorInvalid': 'Wrong game pin. Try another?',
    'join.play': 'PLAY',
    'join.orCreate': 'or create a new game',
    'join.here': 'here',
    'username.label': 'Username',
    'username.errorTaken': 'Already taken. Try another?',
    'username.tooLong': 'Username too long!',
    'home.premium.badge': 'Premium',
    'home.premium.text': 'Upgrade to Premium – no ads, exclusive upgrades and more features',
    'home.welcome': 'Welcome, {{username}}!',
    'home.search': 'Search',
    'home.searchPlaceholder': 'Search for quizzes...',
    'home.favorites': 'Favorites',
    'home.popular': 'Popular',
    'home.yourGames': 'Your games',
    'home.noGames.title': 'No games yet',
    'home.noGames.subtitle': 'Create your first quiz or discover examples to get started.',
    'home.search.noMatches': 'No results for {{term}}. Clear search or create a new quiz.',
    'home.questions': 'questions',
    'home.plays': 'plays',
    'home.participants': 'participants',
    'home.public': 'Public',
    'home.private': 'Private',
    'home.noDescription': 'No description',
    'home.by': 'By {{name}}',
    'home.startGame': 'Start game',
    'home.edit': 'Edit',
    'home.pin': 'PIN',
    'home.copyPin': 'Copy PIN',
    'home.copyLink': 'Copy link',
    'home.starting': 'Starting…',
    'home.hint': 'Upgrades are available in-game. Premium gives more options.',
    'home.trash.show': 'Show trash',
    'home.trash.hide': 'Hide trash',
    'home.trash.title': 'Deleted quizzes',
    'home.trash.empty': 'No deleted quizzes',
    'home.trash.restore': 'Restore',
    'common.error': 'An error occurred',
    'common.close': 'Close',
    // Upgrades
    'upgrades.subtitle': 'Explore upgrades by plan',
    'upgrades.premiumIncludesFree': 'Premium includes all Free upgrades',
    // Billing
    'billing.title': 'Premium membership',
    'billing.subtitle': 'Upgrade to Premium and unlock more features.',
    'billing.loading': 'Loading…',
    'billing.manage': 'Manage subscription',
    'billing.error': 'Something went wrong. Please try again.',
    'billing.success.title': 'Purchase successful',
    'billing.success.subtitle': 'Click below to activate Premium on your account.',
    'billing.activate': 'Activate Premium now',
    'billing.activating': 'Activating…',
    'billing.activated': 'Premium activated! If not visible, revisit your profile.',
    'billing.refreshing': 'Refreshing your session…',
    'billing.goProfile': 'Go to profile',
    'billing.fail.title': 'Payment not completed',
    'billing.fail.subtitle': 'Your purchase could not be completed. You can try again or return to the Premium page.',
    'billing.retry': 'Try again',
    'billing.goPremium': 'Home',
    // Profile
    'profile.title': 'Profile',
    'profile.subtitle': 'Manage your account and subscription',
    'profile.userId': 'User ID',
    'profile.accountSettings': 'Account settings',
    'profile.signOut': 'Sign out',
    'profile.delete': 'Delete account',
    'profile.deleteConfirm': 'Are you sure you want to delete your account? This cannot be undone. You will be sent to the account page to complete deletion.',
    'profile.subscription': 'Subscription',
    'profile.subscription.subtitle': 'Status and benefits',
    'profile.subscription.premium': 'Premium',
    'profile.subscription.free': 'Free',
    'profile.subscription.premiumDesc': 'You have Premium. Enjoy ad-free experience and exclusive features.',
    'profile.subscription.freeDesc': 'You are on Free. Upgrade for more features and no ads.',
    'profile.subscription.startPremium': 'Start Premium',
    'profile.subscription.seePlans': 'See plans',
    'profile.details.title': 'Account details (Keycloak)',
    'profile.details.name': 'Name',
    'profile.details.username': 'Username',
    'profile.details.email': 'Email',
    'profile.details.roles': 'Roles',
    'profile.details.groups': 'Groups',
    'profile.details.issuer': 'Issuer (iss)',
    'profile.details.audience': 'Audience (aud)',
    'profile.details.issued': 'Issued',
    'profile.details.expires': 'Expires',
    'profile.details.resourceRoles': 'Resource roles',
    // Tags
    'tags.educational': 'Educational',
    'tags.party': 'Party',
    'tags.kids': 'Kids',
    'tags.hard': 'Hard',
    'tags.trivia': 'Trivia',
    'tags.music': 'Music',
    'tags.sports': 'Sports',
  },
  nb: {
    // Common
    'common.pts': 'poeng',
    'common.back': 'Tilbake',
    'common.begin': 'Start',
    'common.next': 'Neste',
    'common.exit': 'Avslutt',
    'common.current': 'Aktiv',
    'common.join': 'Bli med',
    'common.joinAnother': 'Bli med i et nytt spill',
    'common.loading': 'Laster…',
    'loading.title': 'Laster…',
    'loading.subtitle': 'Synkroniserer konto og spilldata',
    'loading.hint': 'Dette tar bare noen sekunder.',
    'auth.authorizing': 'Autoriserer…',
    'auth.subtitle': 'Bekrefter Tavl-økten din',
    'auth.hint': 'Du blir sendt videre automatisk.',
    'game.over': 'Bra spilt!',
    'game.placement': 'Du ble nr. {{rank}} av {{total}}',
    'game.placement.pending': 'Beregner plassering…',
    'tv.home.loading': 'Laster dine spill…',
    'tutorial.backToLobby': 'Til lobby',
    'waiting.selectColor': 'Velg farge',
    // Header
    'header.join': 'Bli med',
    'header.signin': 'Logg inn',
    'header.signout': 'Logg ut',
    'header.featured': 'Utvalgte',
    'header.about': 'Om',
    'header.upgrades': 'Oppgraderinger',
    'header.pricing': 'Priser',
    'header.library': 'Bibliotek',
    'header.profile': 'Administrer profil',
    'header.language': 'Språk',
    // Home
    'home.create': 'Ny quiz',
    'home.discover': 'Oppdag',
    'tv.scoreboard': 'Poengtavle',
    'tv.podium.title': 'Vinnere!',
    'common.finish': 'Ferdig',
    'join.title': 'Har du en game pin?',
    'join.subtitle': 'Skriv inn game pin for å bli med i et eksisterende spill.',
    'join.placeholder': 'Game pin…',
    'join.label': 'Game pin',
    'join.errorMissing': 'Skriv inn en game pin',
    'join.errorInvalid': 'Feil game pin. Prøv en annen?',
    'join.play': 'SPILL',
    'join.orCreate': 'eller lag et nytt spill',
    'join.here': 'her',
    'username.label': 'Brukernavn',
    'username.errorTaken': 'Allerede tatt. Prøv et annet?',
    'username.tooLong': 'Brukernavn er for langt!',
    'home.premium.badge': 'Premium',
    'home.premium.text': 'Oppgrader til Premium – ingen annonser, eksklusive oppgraderinger og flere funksjoner',
    'home.welcome': 'Velkommen, {{username}}!',
    'home.search': 'Søk',
    'home.searchPlaceholder': 'Søk etter quiz...',
    'home.favorites': 'Favoritter',
    'home.popular': 'Populære',
    'home.yourGames': 'Dine spill',
    'home.noGames.title': 'Ingen spill enda',
    'home.noGames.subtitle': 'Lag din første quiz eller oppdag eksempler for å komme i gang.',
    'home.search.noMatches': 'Ingen treff for {{term}}. Tøm søk eller opprett en ny quiz.',
    'home.questions': 'spørsmål',
    'home.plays': 'spillinger',
    'home.participants': 'deltakere',
    'home.public': 'Offentlig',
    'home.private': 'Privat',
    'home.noDescription': 'Ingen beskrivelse',
    'home.by': 'Av {{name}}',
    'home.startGame': 'Start spill',
    'home.edit': 'Rediger',
    'home.pin': 'PIN',
    'home.copyPin': 'Kopier PIN',
    'home.copyLink': 'Kopier lenke',
    'home.starting': 'Starter…',
    'home.hint': 'Oppgraderinger er tilgjengelige i spillet. Premium gir flere muligheter.',
    'home.trash.show': 'Vis papirkurv',
    'home.trash.hide': 'Skjul papirkurv',
    'home.trash.title': 'Slettede quizer',
    'home.trash.empty': 'Ingen slettede quizer',
    'home.trash.restore': 'Gjenopprett',
    'common.error': 'En feil oppstod',
    'common.close': 'Lukk',
    // Upgrades
    'upgrades.subtitle': 'Utforsk oppgraderinger per abonnement',
    'upgrades.premiumIncludesFree': 'Premium inkluderer alle Gratis-oppgraderinger',
    // Billing
    'billing.title': 'Premium-medlemskap',
    'billing.subtitle': 'Oppgrader til Premium og lås opp flere funksjoner.',
    'billing.loading': 'Laster…',
    'billing.manage': 'Administrer abonnement',
    'billing.error': 'Noe gikk galt. Prøv igjen.',
    'billing.success.title': 'Kjøp vellykket',
    'billing.success.subtitle': 'Trykk under for å aktivere Premium på kontoen din.',
    'billing.activate': 'Aktiver Premium nå',
    'billing.activating': 'Aktiverer…',
    'billing.activated': 'Premium aktivert! Hvis du ikke ser det, gå tilbake til profilen.',
    'billing.refreshing': 'Oppdaterer økten din…',
    'billing.goProfile': 'Gå til profil',
    'billing.fail.title': 'Betaling ikke fullført',
    'billing.fail.subtitle': 'Kjøpet kunne ikke fullføres. Du kan prøve igjen eller gå tilbake til Premium-siden.',
    'billing.retry': 'Prøv igjen',
    'billing.goPremium': 'Hjem',
    // Profile
    'profile.title': 'Profil',
    'profile.subtitle': 'Administrer kontoen din og abonnement',
    'profile.userId': 'Bruker-ID',
    'profile.accountSettings': 'Kontoinnstillinger',
    'profile.signOut': 'Logg ut',
    'profile.delete': 'Slett konto',
    'profile.deleteConfirm': 'Er du sikker på at du vil slette kontoen din? Dette kan ikke angres. Du vil bli sendt til kontosiden for å fullføre slettingen.',
    'profile.subscription': 'Abonnement',
    'profile.subscription.subtitle': 'Status og fordeler',
    'profile.subscription.premium': 'Premium',
    'profile.subscription.free': 'Gratis',
    'profile.subscription.premiumDesc': 'Du har Premium. Nyt annonsefri opplevelse og eksklusive funksjoner.',
    'profile.subscription.freeDesc': 'Du er på Gratis. Oppgrader for å få flere funksjoner og ingen annonser.',
    'profile.subscription.startPremium': 'Start Premium',
    'profile.subscription.seePlans': 'Se planer',
    'profile.details.title': 'Kontodetaljer (Keycloak)',
    'profile.details.name': 'Navn',
    'profile.details.username': 'Brukernavn',
    'profile.details.email': 'E-post',
    'profile.details.roles': 'Roller',
    'profile.details.groups': 'Grupper',
    'profile.details.issuer': 'Utsteder (iss)',
    'profile.details.audience': 'Audience (aud)',
    'profile.details.issued': 'Utstedt',
    'profile.details.expires': 'Utløper',
    'profile.details.resourceRoles': 'Ressurs-roller',
    // Tags
    'tags.educational': 'Lærende',
    'tags.party': 'Party',
    'tags.kids': 'Barn',
    'tags.hard': 'Vanskelig',
    'tags.trivia': 'Trivia',
    'tags.music': 'Musikk',
    'tags.sports': 'Sport',
  }
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const fromStorage = (localStorage.getItem('lang') as Lang) || undefined;
    const nav = (navigator?.language || 'en').slice(0, 2) as Lang;
    const initial = fromStorage && (fromStorage === 'en' || fromStorage === 'nb') ? fromStorage : (nav === 'nb' ? 'nb' : 'en');
    setLangState(initial);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch {}
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const dict = bundles[lang] || bundles.en;
    let out = dict[key] || bundles.en[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
      });
    }
    return out;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

export default I18nContext;
