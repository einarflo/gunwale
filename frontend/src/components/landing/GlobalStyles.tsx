import React from "react";

export default function GlobalStyles() {
  return (
    <style>{`
      :root {
        --g1: 59,130,246;   /* blue-500 */
        --g2: 236,72,153;   /* pink-500 */
        --g3: 16,185,129;   /* emerald-500 */
        --g4: 245,158,11;   /* amber-500 */
        --g5: 239,68,68;    /* red-500 */
        --grid: rgba(59,130,246,0.08);
      }
      @keyframes meshShift {
        0%, 100% { transform: translate3d(0,0,0) scale(1); filter: hue-rotate(0deg); }
        33% { transform: translate3d(-2%, 1%, 0) scale(1.02); filter: hue-rotate(20deg); }
        66% { transform: translate3d(2%, -1%, 0) scale(1.03); filter: hue-rotate(-20deg); }
      }
      @keyframes floatSoft {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-8px); }
      }
      @keyframes glowPulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.8; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .glass {
        backdrop-filter: blur(16px);
        background: linear-gradient(
          135deg,
          rgba(255,255,255,0.9),
          rgba(255,255,255,0.7)
        );
        border: 2px solid rgba(59,130,246,0.2);
        box-shadow: 0 8px 32px rgba(59,130,246,0.1);
      }
      .grid-overlay::before {
        content: "";
        position: absolute; inset: 0;
        background-image:
          linear-gradient(to right, var(--grid) 1px, transparent 1px),
          linear-gradient(to bottom, var(--grid) 1px, transparent 1px);
        background-size: 40px 40px;
        mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
        pointer-events: none;
      }
    `}</style>
  );
}
