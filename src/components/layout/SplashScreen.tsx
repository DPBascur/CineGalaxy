"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    // La cinemática dura 3.8 segundos exactos estilo streaming
    const timer = setTimeout(() => {
      onComplete();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generadores para rallitos navegantes
  const beams = Array.from({ length: 12 });

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden">
      {/* Light Beams de Velocidad Warp (Rallitos) */}
      <div className="absolute inset-0 z-0">
        {beams.map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[2px] bg-primary rounded-full shadow-[0_0_15px_#8B5CF6,0_0_30px_#C084FC]"
            initial={{ 
              x: "-100vw", 
              y: `${Math.random() * 100}vh`, 
              width: `${Math.random() * 300 + 100}px`,
              opacity: Math.random() * 0.5 + 0.3
            }}
            animate={{ x: "120vw" }}
            transition={{ 
              duration: Math.random() * 1.5 + 0.6, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "linear"
            }}
            style={{ willChange: "transform, opacity" }}
          />
        ))}
      </div>

      {/* Luz volumétrica de fondo que crece */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.5, 2, 4] }}
        transition={{ duration: 3.8, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-80"
      />

      {/* Titulo que hace zoom dramático estilo Netflix N */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1, 1.2, 8], 
          opacity: [0, 1, 1, 0] 
        }}
        transition={{ 
          duration: 3.8, 
          times: [0, 0.15, 0.7, 1], // Aparece rápido, se mantiene, te traga y desaparece
          ease: "easeInOut" 
        }}
        className="relative z-10 flex flex-col items-center justify-center transform-gpu"
        style={{ willChange: "transform, opacity", transformOrigin: "center center" }}
      >
        <h1 
          className="font-extrabold text-7xl md:text-9xl tracking-tighter"
          style={{ 
            color: "#8B5CF6", // Primary
            textShadow: "0px 0px 30px rgba(139,92,246,0.8), 0px 0px 80px rgba(139,92,246,1), 0px 0px 120px rgba(192,132,252,0.8)" 
          }}
        >
          CineGalaxy
        </h1>
      </motion.div>
    </div>
  );
}
