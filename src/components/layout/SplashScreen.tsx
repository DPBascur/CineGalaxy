"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "@/components/ui/LottieClient";
import cineGalaxyAnimation from "../../../public/animations/CineGalaxy.json";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // La animación Lottie dura ~3 s; al terminar hacemos fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Fondo con gradiente radial violeta */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1A0A2E] via-[#09090B] to-[#09090B] opacity-90" />

          {/* Contenido centrado */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-[280px] h-[280px]">
              <Lottie 
                animationData={cineGalaxyAnimation} 
                loop={false}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            
            <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#C4B5FD] via-[#8B5CF6] to-[#6D28D9]">
              CineGalaxy
            </h1>
            
            <p className="mt-3 text-[10px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.3em] text-white/40">
              PORTAL PRIVADO DE STREAMING
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
