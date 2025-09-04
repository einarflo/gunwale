import React from "react";

export default function AnimatedGradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Playful animated gradient blobs */}
      <div
        className="absolute -top-40 -left-40 h-[70vw] w-[70vw] rounded-full blur-3xl opacity-40"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g1),0.4), transparent 70%)",
          animation: "glowPulse 6s ease-in-out infinite"
        }}
      />
      <div
        className="absolute -top-20 right-[-15%] h-[60vw] w-[60vw] rounded-full blur-3xl opacity-35"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g2),0.3), transparent 65%)",
          animation: "glowPulse 8s ease-in-out infinite 1s"
        }}
      />
      <div
        className="absolute bottom-[-20%] left-1/4 h-[75vw] w-[75vw] rounded-full blur-3xl opacity-40"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g3),0.3), transparent 60%)",
          animation: "glowPulse 10s ease-in-out infinite 2s"
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[50vw] w-[50vw] rounded-full blur-3xl opacity-30"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g4),0.25), transparent 55%)",
          animation: "glowPulse 12s ease-in-out infinite 3s"
        }}
      />
      <div
        className="absolute top-1/4 right-1/4 h-[40vw] w-[40vw] rounded-full blur-3xl opacity-35"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g5),0.3), transparent 50%)",
          animation: "glowPulse 7s ease-in-out infinite 4s"
        }}
      />
      {/* Animated mesh layer */}
      <div
        className="absolute inset-0 mix-blend-multiply opacity-50"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 20%, rgba(59,130,246,0.08), transparent 70%), " +
            "radial-gradient(50% 50% at 80% 30%, rgba(236,72,153,0.06), transparent 70%)",
          animation: "meshShift 25s ease-in-out infinite",
        }}
      />
      {/* Decorative grid */}
      <div className="absolute inset-0 grid-overlay" />
    </div>
  );
}
