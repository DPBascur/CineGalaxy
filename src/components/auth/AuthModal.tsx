"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { supabase } from "@/lib/supabase";
import { X, Eye, EyeOff } from "lucide-react";
import Lottie from "@/components/ui/LottieClient";
import loadingAnimation from "../../../public/animations/Loading.json";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { motion } from "framer-motion";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

// Extraído para que NO re-renderice al teclear contraseñas
const MemoizedParticles = memo(({ init }: { init: boolean }) => {
  const particlesOptions = useMemo(() => ({
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
        resize: { enable: true, delay: 0.5 }
      },
      modes: {
        grab: { distance: 140, links: { opacity: 0.5 } }
      }
    },
    particles: {
      color: { value: ["#C084FC", "#8B5CF6", "#ffffff"] },
      links: { color: "#8B5CF6", distance: 150, enable: true, opacity: 0.2, width: 1 },
      move: { direction: "none" as const, enable: true, outModes: { default: "bounce" as const }, random: true, speed: 0.8, straight: false },
      number: { density: { enable: true, width: 800, height: 800 }, value: 80 },
      opacity: { value: 0.6, animation: { enable: true, speed: 1, sync: false } },
      shape: { type: "circle" as const },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  }), []);

  if (!init) return null;
  return (
    <Particles
      id="tsparticles"
      options={particlesOptions}
      className="absolute inset-0 z-[1]"
    />
  );
});

export default function AuthModal({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg("Credenciales inválidas. Acceso denegado.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background">
      {/* Galactic Particles Background Memorized */}
      <MemoizedParticles init={init} />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
        className="z-10 w-full max-w-md neon-border-wrapper shadow-[0_0_50px_rgba(139,92,246,0.3)]"
      >
        <div className="relative p-10 w-full h-full glass-panel backdrop-blur-2xl bg-black/60 rounded-3xl">
          <div className="text-center mb-10">
            <motion.h2 
              animate={{ 
                textShadow: ["0px 0px 10px rgba(139,92,246,0.5)", "0px 0px 30px rgba(139,92,246,1)", "0px 0px 10px rgba(139,92,246,0.5)"] 
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl font-extrabold text-white mb-2 tracking-widest"
            >
              CineGalaxy
            </motion.h2>
            <p className="text-muted/80 text-sm font-medium tracking-wide mt-3">
              Portal Privado · Ingrese sus credenciales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-muted/70 uppercase tracking-wider mb-2">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/[0.03] border border-white/10 focus:border-primary focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] rounded-xl p-3.5 text-white transition-all outline-none placeholder:text-white/20"
                placeholder="admin@cinegalaxy.com"
              />
            </div>

            <div>
              <label className="block text-sm text-muted/70 tracking-wider mb-1 font-bold">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-primary focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] rounded-xl p-3.5 pr-12 text-white transition-all outline-none placeholder:text-white/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-bold tracking-widest uppercase text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 mt-8"
            >
              {isLoading ? <Lottie animationData={loadingAnimation} loop={true} className="w-8 h-8" /> : "Iniciar Sesión"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
