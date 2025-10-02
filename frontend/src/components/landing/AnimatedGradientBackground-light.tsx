import React from "react";

export default function AnimatedGradientBackgroundLight() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
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
