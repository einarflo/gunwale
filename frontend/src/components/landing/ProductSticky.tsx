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
            <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-blue-200 flex flex-col justify-center items-center bg-white">
              {/* Kahoot-style question area */}
              <div className="w-full px-6 pt-6 pb-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span className="font-mono">tavl.tsx</span>
                  <span>● ● ●</span>
                </div>
                <div className="mb-4">
                  <div className="text-lg font-semibold text-gray-800">What is the capital of Norway?</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center h-12 rounded-lg bg-red-500 text-white font-bold shadow hover:bg-red-600 transition">Oslo</button>
                  <button className="flex items-center justify-center h-12 rounded-lg bg-blue-500 text-white font-bold shadow hover:bg-blue-600 transition">Bergen</button>
                  <button className="flex items-center justify-center h-12 rounded-lg bg-yellow-400 text-white font-bold shadow hover:bg-yellow-500 transition">Trondheim</button>
                  <button className="flex items-center justify-center h-12 rounded-lg bg-green-500 text-white font-bold shadow hover:bg-green-600 transition">Stavanger</button>
                </div>
              </div>
              {/* Simulated player avatars */}
              <div className="absolute top-4 right-6 flex gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-200 border-2 border-white shadow" />
                <div className="h-8 w-8 rounded-full bg-pink-200 border-2 border-white shadow" />
                <div className="h-8 w-8 rounded-full bg-yellow-200 border-2 border-white shadow" />
                <div className="h-8 w-8 rounded-full bg-green-200 border-2 border-white shadow" />
              </div>
              {/* Simulated timer and points */}
              <div className="absolute bottom-4 left-6 flex items-center gap-4">
                <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-mono text-xs shadow">Time: 12s</div>
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shadow">Points: 980</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
