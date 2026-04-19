"use client";

import { motion, Variants } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { SpaceParticles } from "@/components/layout/SpaceParticles";
import { Suspense } from "react";
import { ShieldCheck, Zap, Tv, Smartphone, Download, CheckCircle2, Laptop } from "lucide-react";
import Image from "next/image";

export default function AppsLandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 100 } 
    }
  };

  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#C084FC]" />,
      title: "Escudo Anti-Anuncios Nivel O.S.",
      description: "Ambas versiones repelen de raíz cualquier pop-up, pop-under o comercial incrustado en los visores gracias a intercepción nativa."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Desempeño Crudo y Aceleración GPU",
      description: "Libérate de las pestañas pesadas. Procesamiento dedicado que triplica los fotogramas de tus películas en 4K y evita congelamientos."
    },
    {
      icon: <Tv className="w-8 h-8 text-[#46d369]" />,
      title: "Smart TV y Android Native",
      description: "El APK de Android está optimizado para consumir el API nativo de tu teléfono. Lánzalo inalámbricamente o instálalo en tu Android TV."
    }
  ];

  return (
    <>
      <Suspense fallback={<div className="h-16 w-full fixed top-0 bg-transparent z-50"></div>}>
        <Navbar />
      </Suspense>
      <main className="min-h-screen bg-background relative overflow-hidden pt-24 pb-20 selection:bg-primary/30">
        <SpaceParticles id="apps-stars" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#C084FC]/10 rounded-full blur-[150px] pointer-events-none translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10 pt-10">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[70vh]"
          >
            {/* Left Content */}
            <div className="flex flex-col justify-center max-w-2xl">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm mb-6 w-fit backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Versión 1.0.1 Oficial Disponible
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-primary/40 leading-[1.1]">
                CineGalaxy <br />Sin Límites.
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted/90 mb-8 leading-relaxed font-medium">
                Desata el verdadero poder del cine en casa. Extrajimos la galaxia del navegador comercial para entregarte aplicaciones puras, ultrarrápidas y <span className="text-white font-bold underline decoration-primary decoration-2 underline-offset-4">100% libres de publicidad invasiva</span>.
              </motion.p>

              {/* Download Buttons */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-4">
                <a 
                  href="https://github.com/DPBascur/CineGalaxy/releases/download/v1.0.1/CineGalaxy.Setup.1.0.1.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Descargar CineGalaxy para Windows"
                  className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-primary px-8 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]"
                >
                  <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-[150%] skew-x-[-45deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/80">Descargar para</span>
                      <span className="text-base">Windows / PC</span>
                    </div>
                  </div>
                </a>

                <a 
                  href="https://github.com/DPBascur/CineGalaxy/releases/download/v1.0.0/CineGalaxy.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Descargar CineGalaxy para Android"
                  className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-surface border border-white/10 px-8 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white/5 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(192,132,252,0.2)]"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-accent" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">Descargar para</span>
                      <span className="text-base text-white/90">Android & TV</span>
                    </div>
                  </div>
                </a>
              </motion.div>
              
              <motion.p variants={itemVariants} className="text-xs text-muted/50 mt-6 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                No requiere tarjeta de crédito, registro opcional. Instaladores firmados y seguros.
              </motion.p>
            </div>

            {/* Right Content - 3D Mockup */}
            <motion.div 
              variants={itemVariants}
              className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-full flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-[3rem] -rotate-6 blur-3xl" />
              <motion.img 
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                src="/cinegalaxy_apps_mockup.png" 
                alt="CineGalaxy Premium Apps on Phone and Laptop" 
                className="w-full h-auto object-contain max-h-[600px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
                style={{
                  filter: "drop-shadow(0px 0px 40px rgba(139,92,246,0.3))"
                }}
              />
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <div className="mt-32 mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Ingeniería que puedes <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sentir.</span></h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">Cada píxel fue re-entrenado para el código nativo. Tu experiencia cinematográfica dejará de depender del navegador web.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-surface/40 backdrop-blur-md border border-white/5 hover:border-primary/30 p-8 rounded-3xl transition-all duration-300 hover:bg-surface/80 hover:shadow-[0_10px_40px_rgba(139,92,246,0.1)] group flex flex-col items-start"
                >
                  <div className="p-3 bg-white/5 rounded-2xl mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                  <p className="text-muted leading-relaxed text-sm md:text-base font-medium">{feat.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </main>
      
      {/* Footer minimalista */}
      <footer className="w-full py-8 border-t border-white/5 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-80">
            <img src="/cinegalaxy_logo.png" alt="Logo" className="w-6 h-6 rounded grayscale" />
            <span className="text-sm font-bold text-white tracking-widest">CINEGALAXY APPS</span>
          </div>
          <p className="text-xs text-muted font-medium">Hecho para el infinito. v1.0.0 © 2026</p>
        </div>
      </footer>
    </>
  );
}
