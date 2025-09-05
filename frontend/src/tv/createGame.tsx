import { useState } from "react";
import Ads from "../components/Ads";
import { post } from "../api";
import { useKeycloak } from "../auth/KeycloakProvider";
import { useNavigate } from "react-router-dom";
import GameForm from './components/GameForm';

const CreateGame = () => {
    const { isPremium, userId } = useKeycloak();

    const navigate = useNavigate();

    const [error, seterror] = useState(false);

    const insertGame = async ({ name, description, isPublic }: { name: string; description: string; isPublic: boolean; headerImage?: string | null }) => {
      try {
        const res = await post(`/games`, {
          name,
          description,
          created_by: userId,
          status: "created",
          isPublic: isPublic ? 1 : 0,
        });
        const created = res.data;
        const selector = created?.uuid || created?.id || created;
        navigate(`/home/edit/${selector}`);
      } catch (e) {
        seterror(true);
        throw e;
      }
    };

    return (
        <>
        <div className="fixed inset-0 z-0 " />
        <div className="relative z-10 flex justify-center pt-10 min-h-screen">
          <div className="w-full max-w-7xl px-6">
            <GameForm
              title="Quiznavn og beskrivelse"
              showImageUpload
              submitText="Opprett quiz"
              cancelText="Avbryt"
              onSubmit={insertGame as any}
              onCancel={() => navigate('/home')}
            />
            { !isPremium && <div className="rounded-2xl justify-center align-center bg-white/90 shadow p-6 mt-10">
            <div className="font-bold text-lg w-full justfy-center text-gray-300 m-4">
              Google Ads
            </div>
              {/*<Ads />*/}
            
            </div>}
          </div>
        </div>
        </>
    );
};

export default CreateGame;
