/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../api";

const StripeReturn = () => {
  const navigate = useNavigate();

  // Get status of session
  const getSessionStatus = (sessionId: string) => {
    const sid = encodeURIComponent(sessionId || '');
    get(`/billing/session-status?session_id=${sid}`)
      .then(res => {
        if (res.data.status === 'complete') navigate('/home/billing/success');
        else navigate('/home/billing/error');
      })
      .catch(err => {
        console.log("Error when getting session status", err);
      });
  }

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get('session_id');
    // Delay checking to allow Keycloak/frontend to resync state first
    const t = setTimeout(() => {
      getSessionStatus(sessionId || '');
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-b-4 border-blue-400" />
        <div className="text-xl font-semibold text-purple-700">Validating purchase ...</div>
        <div className="text-gray-500 text-sm">
            Updating your account and game data
        </div>
      </div>
    </div>
  );
}

export default StripeReturn;
