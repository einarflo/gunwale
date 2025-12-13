import { createContext, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Question } from "./game";

type PersistedState = {
  questions: Question[];
  currentQ: number;
  started: boolean;
  showScoreBoard: boolean;
  showTutorial: boolean;
  preCountdown: boolean;
  loading: boolean;
};

const DEFAULT_STATE: PersistedState = {
  questions: [],
  currentQ: 0,
  started: false,
  showScoreBoard: false,
  showTutorial: false,
  preCountdown: false,
  loading: false,
};

const KEY_PREFIX = "tavl.tv.state.";

const loadState = (gameInstanceId?: string): PersistedState => {
  if (!gameInstanceId) return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${gameInstanceId}`);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (_) {
    return DEFAULT_STATE;
  }
};

const TVGameContext = createContext<{
  state: PersistedState;
  setState: React.Dispatch<SetStateAction<PersistedState>>;
  clearState: () => void;
}>({
  state: DEFAULT_STATE,
  setState: (_value: SetStateAction<PersistedState>) => {},
  clearState: () => {},
});

export const TVGameProvider = ({ children }: { children: ReactNode }) => {
  const { gameInstanceId } = useParams<{ gameInstanceId: string }>();
  const [state, setState] = useState<PersistedState>(() => loadState(gameInstanceId));

  // Reload persisted state when game instance changes
  useEffect(() => {
    setState(loadState(gameInstanceId));
  }, [gameInstanceId]);

  // Persist on change
  useEffect(() => {
    if (!gameInstanceId) return;
    try {
      localStorage.setItem(`${KEY_PREFIX}${gameInstanceId}`, JSON.stringify(state));
    } catch (_) {}
  }, [state, gameInstanceId]);

  const clearState = () => {
    setState(DEFAULT_STATE);
    if (gameInstanceId) {
      try { localStorage.removeItem(`${KEY_PREFIX}${gameInstanceId}`); } catch (_) {}
    }
  };

  const value = useMemo(() => ({ state, setState, clearState }), [state]);
  return <TVGameContext.Provider value={value}>{children}</TVGameContext.Provider>;
};

export const useTVGame = () => useContext(TVGameContext);

export default TVGameContext;
