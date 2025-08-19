import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ProductSticky() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1.05]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 3]);
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section id="game" className="relative mt-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-300 bg-blue-50 px-4 py-2 text-sm text-blue-600 font-medium">
            Spillopplevelse
          </div>
          <h2 className="mt-4 text-4xl font-bold sm:text-5xl text-gray-800">
            Sanntids quiz med oppgraderinger
          </h2>
          <p className="mt-4 text-xl text-gray-600 leading-relaxed">
            Spill mot andre spillere i sanntid, bruk oppgraderinger for å få fordel, 
            og se hvem som kan svare raskest og riktigst. Hver runde er unik og spennende!
          </p>
          <ul className="mt-8 space-y-3 text-lg text-gray-700">
            <li className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-blue-400 animate-bounce"></div>
              Sanntids konkurranse mot andre spillere
            </li>
            <li className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-purple-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              8 unike oppgraderinger å låse opp
            </li>
            <li className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-pink-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
              Responsivt design for alle enheter
            </li>
          </ul>
        </div>
        <div className="relative h-[500px] md:h-[600px]" ref={ref}>
          <motion.div
            style={{ scale, rotate, y }}
            className="glass sticky top-28 mx-auto h-[400px] w-full max-w-[500px] rounded-3xl p-6 shadow-2xl shadow-blue-200/50"
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-blue-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30" />
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="font-mono">tavl-game.tsx</span>
                  <span>● ● ●</span>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-2/3"></div>
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400 animate-pulse"></div>
                  <div className="h-3 w-3 rounded-full bg-purple-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="h-3 w-3 rounded-full bg-pink-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
