import { useState } from "react";
import { post, put } from "../api";
import { useKeycloak } from "../auth/KeycloakProvider";
import { useNavigate } from "react-router-dom";
import GameForm from './components/GameForm';
import GlobalStyles from '../components/landing/GlobalStyles';
import ParallaxOrbs from '../components/ParallaxOrbs';
import ParallaxScroll from '../components/ParallaxScroll';
import Header from '../components/landing/Header';
import Footer from '../components/Footer';

const CreateGame = () => {
    const { isPremium, userId } = useKeycloak();

    const navigate = useNavigate();

    const [error, seterror] = useState(false);

    const insertGame = async ({ name, description, isPublic, tags, headerImage }: { name: string; description: string; isPublic: boolean; tags: string[]; headerImage?: string | null }) => {
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
        // Set tags (ignore failures)
        if (Array.isArray(tags)) {
          try { await put(`/tags/game/${selector}`, { slugs: tags }); } catch(_) {}
        }
        // Placeholder: headerImage can be handled after basic game creation if needed
        navigate(`/home/edit/${selector}`);
      } catch (e) {
        seterror(true);
        throw e;
      }
    };

    return (
      <>
        <div className="relative min-h-screen bg-white text-slate-900 overflow-hidden" style={{ fontFamily: 'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
          <GlobalStyles />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(106,113,250,0.2)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(156,138,250,0.18)_0%,transparent_60%),linear-gradient(to_bottom_right,rgba(106,113,250,0.12),rgba(156,138,250,0.08),transparent)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(106,113,250,0.05)_0%,transparent_70%)] animate-pulse-slow" />
          <ParallaxOrbs />
          <ParallaxScroll />
          <div className="mx-auto max-w-6xl px-6 pt-24 pb-12">
            <div className="mb-6">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 drop-shadow">Ny quiz</div>
              <div className="text-slate-600">Gi quizen et navn, beskrivelse og tags.</div>
            </div>
            <div className="rounded-3xl p-6 sm:p-8 shadow-xl bg-white backdrop-blur-md border border-slate-100">
              <GameForm
                title="Quiznavn og beskrivelse"
                showImageUpload
                initialImageUrl={null}
                submitText="Opprett quiz"
                cancelText="Avbryt"
                onSubmit={insertGame as any}
                onCancel={() => navigate('/home')}
              />
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
};

export default CreateGame;
