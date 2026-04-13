"use client";

import { SpaceParticles } from "@/components/layout/SpaceParticles";

export default function Footer() {
  return (
    <footer className="w-full relative overflow-hidden mt-12 border-t border-primary/20 z-20 py-10 px-6 text-center">
      
      {/* Space CSS Particles Overlay */}
      <div className="absolute inset-0 z-0 bg-background">
        <SpaceParticles id="footer-stars" />
        {/* Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background inline-block to-transparent opacity-80 mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-[-50%] right-[10%] w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>
      
      <div className="max-w-4xl mx-auto flex flex-col gap-4 relative z-10 pointer-events-auto">
        <p className="text-muted text-sm lg:text-base font-medium">
          Creado por <span className="font-bold text-accent neon-text">s4ik0</span> y <span className="font-bold text-accent neon-text">cammmil0</span>. Todos los derechos reservados &copy; {new Date().getFullYear()}.
        </p>
        <div className="p-5 bg-surface/60 backdrop-blur-md rounded-xl border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <p className="text-muted/60 text-xs leading-relaxed max-w-3xl mx-auto">
            Aviso legal: Esta aplicación no aloja ningún archivo de video, ni distribuye material protegido por derechos de autor. Todo el contenido reproducido es indexado de manera automática a través de proveedores externos y APIs públicas de terceros. No nos hacemos responsables por el uso que se le dé la plataforma por parte de los miembros autorizados.
          </p>
        </div>
      </div>
    </footer>
  );
}
