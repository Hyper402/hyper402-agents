"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function Esotericbg() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotSlow = useTransform(mx, [-300, 300], [-5, 5]);
  const driftX = useTransform(mx, [-300, 300], [-30, 30]);
  const driftY = useTransform(my, [-300, 300], [-20, 20]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mx.set(e.clientX - cx);
      my.set(e.clientY - cy);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0010] to-[#15000a]" />

      {/* glowing orbs */}
      <motion.div
        style={{ x: driftX, y: driftY }}
        className="absolute -top-40 -left-40 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#7e22ce]/40 to-[#ef4444]/30" />
      </motion.div>
      <motion.div
        style={{ x: driftX, y: driftY }}
        className="absolute -bottom-40 -right-40 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-25"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#ef4444]/30 to-[#a855f7]/20" />
      </motion.div>

      {/* silhouette layer */}
      <motion.img
        src="/hero-silhouette.png"
        alt=""
        aria-hidden
        style={{ x: driftX, y: driftY }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] max-w-none opacity-[0.75] mix-blend-screen"
      />

      {/* arcane rings */}
      <motion.svg
        viewBox="0 0 1000 1000"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] opacity-50"
        style={{ rotate: rotSlow }}
      >
        <defs>
          <radialGradient id="ringGlow" r="60%">
            <stop offset="0%" stopColor="rgba(168,85,247,.9)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
          </radialGradient>
        </defs>
        <motion.circle
          cx="500"
          cy="500"
          r="420"
          fill="none"
          stroke="url(#ringGlow)"
          strokeWidth="1.5"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
        />
        <motion.circle
          cx="500"
          cy="500"
          r="310"
          fill="none"
          stroke="rgba(239,68,68,.55)"
          strokeWidth="1.2"
          strokeDasharray="6 12"
          initial={{ rotate: 360 }}
          animate={{ rotate: 0 }}
          transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
        />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const x = 500 + Math.cos(a) * 310;
          const y = 500 + Math.sin(a) * 310;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="rgba(239,68,68,.7)"
              stroke="rgba(239,68,68,.2)"
            />
          );
        })}
      </motion.svg>

      {/* subtle film grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,\
            <svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>\
              <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>\
              <rect width='100%' height='100%' filter='url(%23n)' opacity='0.4'/>\
              <g opacity='0.15'>\
                <rect width='100%' height='2' y='0' fill='white'/><rect width='100%' height='2' y='8' fill='white'/>\
                <rect width='100%' height='2' y='16' fill='white'/><rect width='100%' height='2' y='24' fill='white'/>\
              </g>\
            </svg>\")",
          backgroundSize: "auto",
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
