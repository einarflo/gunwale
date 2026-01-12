import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../auth/KeycloakProvider";
import { useI18n } from "../i18n/I18nProvider";
import SplashScreen from "./SplashScreen";

export default function Authorizing() {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const { t } = useI18n();

  useEffect(() => {
    // Wait for keycloak state to update
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo');
      const safeReturnTo = returnTo && returnTo.startsWith('/') ? returnTo : null;
      if (keycloak?.authenticated) {
        navigate(safeReturnTo || "/home", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }, 3000); // Wait 1.2s for state to sync
    return () => clearTimeout(timer);
  }, [keycloak?.authenticated, navigate]);

  return (
    <SplashScreen
      title={t("auth.authorizing")}
      subtitle={t("auth.subtitle")}
      hint={t("auth.hint")}
    />
  );
}
