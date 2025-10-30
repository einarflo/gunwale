import SplashScreen from "./SplashScreen";
import { useI18n } from "../i18n/I18nProvider";

export default function Loading() {
  const { t } = useI18n();

  return (
    <SplashScreen
      title={t("loading.title") || t("common.loading")}
      subtitle={t("loading.subtitle")}
      hint={t("loading.hint")}
    />
  );
}
