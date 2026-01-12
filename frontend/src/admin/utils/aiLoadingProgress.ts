import { useEffect, useState } from "react";

const modelTimeTo90Ms = (model?: string) => {
  const m = (model || "").toLowerCase();
  if (m.includes("3b")) return 6000;
  if (m.includes("deepseek-r1:14b")) return 25000;
  return 15000; // 8B default
};

export const useAiLoadingProgress = (loading: boolean, model?: string) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let tick: ReturnType<typeof setInterval> | undefined;
    let finalize: ReturnType<typeof setTimeout> | undefined;

    if (loading) {
      setProgress(0);
      const expectedMs90 = modelTimeTo90Ms(model);
      const start = Date.now();
      const fastEnd = expectedMs90 * 0.4; // 0 -> 75 quickly
      const slowEnd = expectedMs90; // 75 -> 90 until here
      const superStepMs = 900; // +1% steps cadence after 90%
      let lastStepAt = expectedMs90;

      tick = setInterval(() => {
        const elapsed = Date.now() - start;
        setProgress((prev) => {
          if (elapsed < fastEnd) {
            const p = Math.min(75, Math.max(0, Math.round((elapsed / fastEnd) * 75)));
            return p;
          }
          if (elapsed < slowEnd) {
            const t = (elapsed - fastEnd) / (slowEnd - fastEnd);
            const p = 75 + Math.round(t * 15);
            return Math.min(90, p);
          }
          if (prev < 99) {
            const over = elapsed - lastStepAt;
            const steps = Math.floor(over / superStepMs);
            if (steps >= 1) {
              lastStepAt += steps * superStepMs;
              return Math.min(99, prev + steps);
            }
          }
          return prev;
        });
      }, 120);
    } else {
      setProgress((prev) => (prev < 95 ? 95 : prev));
      finalize = setTimeout(() => setProgress(100), 150);
      const reset = setTimeout(() => setProgress(0), 600);
      return () => clearTimeout(reset);
    }

    return () => {
      if (tick) clearInterval(tick);
      if (finalize) clearTimeout(finalize);
    };
  }, [loading, model]);

  return progress;
};

export default useAiLoadingProgress;
