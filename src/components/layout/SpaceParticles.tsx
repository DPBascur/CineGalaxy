"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export const SpaceParticles = memo(({ id = "tsparticles-bg" }: { id?: string }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia("(max-width: 768px)").matches;

    return {
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        color: { value: ["#C084FC", "#8B5CF6", "#ffffff", "#38BDF8"] },
        move: { direction: "none" as const, enable: true, outModes: { default: "out" as const }, random: true, speed: 0.2, straight: false },
        number: { density: { enable: true, width: 800, height: 400 }, value: isMobile ? 50 : 100 },
        opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 0.5, sync: false } },
        shape: { type: "circle" as const },
        size: { value: { min: 0.5, max: 2 } },
      },
      detectRetina: true,
    };
  }, []);

  if (!init) return null;
  return (
    <Particles
      id={id}
      options={particlesOptions}
      className="absolute inset-0 z-0 w-full h-full pointer-events-none"
    />
  );
});
