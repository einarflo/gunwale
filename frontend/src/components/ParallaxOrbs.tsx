import { useEffect, useState } from "react";

export default function ParallaxOrbs() {
  const [p, setP] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 24;
      const ny = (e.clientY / window.innerHeight - 0.5) * 24;
      setP({ x: nx, y: ny });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {/* Top-left indigo orb (stronger) */}
      <div
        className="absolute -top-24 -left-24 h-[22rem] w-[22rem] rounded-full bg-indigo-400/40 blur-3xl"
        style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
      />
      {/* Bottom-right pink orb */}
      <div
        className="absolute -bottom-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-pink-400/40 blur-3xl"
        style={{ transform: `translate(${-p.x}px, ${-p.y}px)` }}
      />
      {/* Mid-left purple orb */}
      <div
        className="absolute top-1/3 -left-16 h-72 w-72 rounded-full bg-purple-400/35 blur-3xl"
        style={{ transform: `translate(${p.x * 0.6}px, ${p.y * 0.6}px)` }}
      />
      {/* Mid-right fuchsia orb */}
      <div
        className="absolute bottom-1/3 -right-10 h-64 w-64 rounded-full bg-fuchsia-400/35 blur-3xl"
        style={{ transform: `translate(${-p.x * 0.5}px, ${-p.y * 0.5}px)` }}
      />
      {/* Soft center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl"
        style={{ transform: `translate(${p.x * 0.2}px, ${p.y * 0.2}px)` }}
      />
    </div>
  );
}
