import { useEffect, useRef } from 'react';

export default function ParallaxScroll() {
  const layerSlowRef = useRef<HTMLDivElement | null>(null);
  const layerFastRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        // subtle parallax: slow layer moves 6%, fast 12%
        if (layerSlowRef.current) {
          layerSlowRef.current.style.transform = `translate3d(0, ${y * 0.06}px, 0)`;
        }
        if (layerFastRef.current) {
          layerFastRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
        }
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll as any);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {/* Slow stars layer */}
      <div
        ref={layerSlowRef}
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(1px 1px at 8% 10%, rgba(255,255,255,0.95) 0, rgba(255,255,255,0) 2px),\
             radial-gradient(1px 1px at 18% 28%, rgba(255,255,255,0.85) 0, rgba(255,255,255,0) 2px),\
             radial-gradient(1px 1px at 28% 42%, rgba(255,255,255,0.8) 0, rgba(255,255,255,0) 2px),\
             radial-gradient(1px 1px at 38% 18%, rgba(255,255,255,0.9) 0, rgba(255,255,255,0) 2px),\
             radial-gradient(1px 1px at 48% 36%, rgba(255,255,255,0.75) 0, rgba(255,255,255,0) 2px),\
             radial-gradient(1px 1px at 58% 22%, rgba(255,255,255,0.85) 0, rgba(255,255,255,0) 2px),\
             radial-gradient(1px 1px at 68% 40%, rgba(255,255,255,0.9) 0, rgba(255,255,255,0) 2px),\
             radial-gradient(1px 1px at 78% 26%, rgba(255,255,255,0.8) 0, rgba(255,255,255,0) 2px),\
             radial-gradient(1px 1px at 88% 14%, rgba(255,255,255,0.85) 0, rgba(255,255,255,0) 2px),\
             radial-gradient(1px 1px at 92% 34%, rgba(255,255,255,0.8) 0, rgba(255,255,255,0) 2px)'
        }}
      />
      {/* Faster glow layer */}
      <div
        ref={layerFastRef}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(46% 32% at 12% 18%, rgba(99,102,241,0.28), transparent 60%),\
             radial-gradient(40% 30% at 88% 30%, rgba(236,72,153,0.28), transparent 62%),\
             radial-gradient(34% 26% at 50% 8%, rgba(168,85,247,0.22), transparent 65%),\
             radial-gradient(20% 16% at 70% 70%, rgba(59,130,246,0.18), transparent 70%)'
        }}
      />
      {/* Static big bottom glow for depth */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[22rem] w-[90%] rounded-[50%] bg-gradient-to-t from-pink-500/20 via-purple-500/10 to-transparent blur-3xl" />
    </div>
  );
}
