import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../auth/KeycloakProvider";

export default function Authorizing() {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  useEffect(() => {
    // Wait for keycloak state to update
    const timer = setTimeout(() => {
      if (keycloak?.authenticated) {
        navigate("/home", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }, 1200); // Wait 1.2s for state to sync
    return () => clearTimeout(timer);
  }, [keycloak?.authenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-b-4 border-blue-400" />
        <div className="text-xl font-semibold text-purple-700">Authorizing ...</div>
        <div className="text-gray-500 text-sm">
            Syncing your account and game data
        </div>
      </div>
    </div>
  );
}
