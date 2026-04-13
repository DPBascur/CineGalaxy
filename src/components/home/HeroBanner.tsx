"use client";

import { Play, Info } from "lucide-react";
import { Movie } from "@/lib/mockData";
import { motion } from "framer-motion";

interface HeroBannerProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
}

export default function HeroBanner({ movie, onPlay }: HeroBannerProps) {
  return (
    <div className="relative w-full h-[50vh] sm:h-[65vh] md:h-[85vh] flex items-end sm:items-center pb-8 sm:pb-0 overflow-hidden">
      {/* Background Image & Gradient Overlays */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={movie.backdrop_url} 
          alt={movie.title} 
          className="w-full h-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </motion.div>

      <div className="relative z-10 px-4 md:px-12 w-full max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 mb-4"
        >
          <span className="text-accent font-bold tracking-widest text-[10px] sm:text-sm neon-text uppercase">
            Nº 1 en Películas Hoy
          </span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-2 sm:mb-4 text-foreground drop-shadow-xl leading-tight"
        >
          {movie.title}
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold mb-3 sm:mb-6"
        >
          <span className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">{movie.match}% Para ti</span>
          <span className="text-muted border border-muted/30 px-2 py-0.5 rounded">{movie.year}</span>
          <span className="text-primary">{movie.genre}</span>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xs sm:text-sm md:text-lg text-foreground/80 max-w-2xl mb-4 sm:mb-8 leading-relaxed font-light drop-shadow-md line-clamp-2 sm:line-clamp-3 md:line-clamp-none"
        >
          {movie.description}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 100 }}
          className="flex flex-wrap items-center gap-2 sm:gap-4"
        >
          <button 
            onClick={() => onPlay(movie)}
            className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 bg-foreground text-background font-bold rounded-md hover:bg-white/80 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:scale-105 active:scale-95 duration-200 text-sm sm:text-base"
          >
            <Play fill="currentColor" size={18} />
            Reproducir
          </button>
          <button 
            onClick={() => onPlay(movie)}
            className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 glass-panel text-foreground font-semibold rounded-md hover:bg-white/10 hover-neon transition-all text-sm sm:text-base"
          >
            <Info size={18} />
            Más información
          </button>
        </motion.div>
      </div>
    </div>
  );
}
