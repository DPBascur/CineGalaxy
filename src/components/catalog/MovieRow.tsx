"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Plus, ThumbsUp } from "lucide-react";
import { Movie } from "@/lib/mockData";
import { motion } from "framer-motion";
import clsx from "clsx";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  onRemoveItem?: (movie: Movie) => void;
  delay?: number;
  isTop10?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function MovieRow({ title, movies, onMovieSelect, onRemoveItem, delay = 0, isTop10 = false }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative z-20 px-4 md:px-12 mt-8 mb-12 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 pl-2 border-l-4 border-primary">
        {title}
      </h2>
      
      <button 
        onClick={() => handleScroll("left")}
        className={clsx(
          "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-1.5 md:p-2 glass rounded-full hover-neon transition-all duration-300 hidden md:flex",
          !isHovered ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
      </button>

      <motion.div 
        ref={rowRef}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className={clsx("flex gap-3 md:gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide px-4", isTop10 ? "py-8" : "py-4")}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {movies.map((movie, index) => (
          <motion.div 
            key={movie.id}
            variants={itemVariants}
            className={clsx(
              "relative flex-none transition-all duration-300 transform md:hover:scale-110 md:hover:z-30 cursor-pointer flex justify-end group/card",
              isTop10 
                ? "w-[180px] h-[210px] sm:w-[220px] sm:h-[255px] md:w-[260px] md:h-[300px] lg:w-[320px] lg:h-[375px]" 
                : "w-[140px] h-[210px] sm:w-[170px] sm:h-[255px] md:w-[200px] md:h-[300px] lg:w-[250px] lg:h-[375px] rounded-lg shadow-lg md:hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
            )}
            onClick={() => onMovieSelect(movie)}
          >
            {isTop10 && (
              <span 
                className="absolute left-0 bottom-0 translate-y-[10%] text-[130px] sm:text-[160px] md:text-[200px] lg:text-[250px] font-black leading-[0.7] tracking-tighter pointer-events-none select-none z-10"
                style={{ 
                  WebkitTextStroke: "3px #666", 
                  WebkitTextFillColor: "#141414",
                  color: "#141414",
                  textShadow: "0px 0px 10px rgba(0,0,0,0.8)"
                }}
              >
                {index + 1}
              </span>
            )}
            <div className={clsx(
              "relative h-full overflow-hidden rounded-lg transition-shadow duration-300",
              isTop10 ? "w-[75%] sm:w-[70%] shadow-2xl md:group-hover/card:shadow-[0_0_25px_rgba(139,92,246,0.5)] z-20" : "w-full"
            )}>
            <img 
              src={movie.poster_url} 
              alt={movie.title} 
              className="w-full h-full object-cover transition-opacity duration-300 group-hover/card:opacity-75"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <h3 className="font-bold text-sm text-foreground drop-shadow-md line-clamp-1">{movie.title}</h3>
              <div className="flex gap-2 text-xs font-semibold mt-1">
                <span className="text-green-400">{movie.match}%</span>
                <span className="text-muted">{movie.year}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <button className="flex-1 bg-foreground text-background py-1 rounded flex justify-center items-center hover:bg-white/80 transition-colors">
                  <Play fill="currentColor" size={14} />
                </button>
                <button className="p-1 border border-foreground/50 rounded hover:border-foreground transition-colors hover:text-primary">
                  <Plus size={14} />
                </button>
                <button className="p-1 border border-foreground/50 rounded hover:border-foreground transition-colors hover:text-primary">
                  <ThumbsUp size={14} />
                </button>
              </div>
              
              {/* Botón opcional de remove */}
              {onRemoveItem && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(movie);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full z-50 opacity-0 group-hover/card:opacity-100 transition-opacity drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  title="Quitar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <button 
        onClick={() => handleScroll("right")}
        className={clsx(
          "absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-1.5 md:p-2 glass rounded-full hover-neon transition-all duration-300 hidden md:flex",
          !isHovered ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
      </button>
    </motion.div>
  );
}
