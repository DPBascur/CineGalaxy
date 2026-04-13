"use client";

import { useEffect, useState } from "react";
import { X, Play, Plus, ThumbsUp, Volume2, CheckCircle2 } from "lucide-react";
import { Movie } from "@/lib/mockData";
import { getTVShowDetails, getTVShowEpisodes, getMediaCredits, SeasonInfo, EpisodeInfo, CastMember } from "@/lib/tmdb";
import VideoPlayer from "@/components/video/VideoPlayer";
import clsx from "clsx";

interface PlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function PlayerModal({ movie, onClose }: PlayerModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeInfo[]>([]);
  
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [cast, setCast] = useState<CastMember[]>([]);

  // Fetch Reparto y Temporadas
  useEffect(() => {
    async function fetchTVData() {
      if (movie?.media_type === 'tv') {
        const data = await getTVShowDetails(movie.id);
        setSeasons(data);
        if (data.length > 0) {
          setSelectedSeason(data[0].season_number);
        }
      }
      // Info Cast
      if (movie?.id) {
        getMediaCredits(movie.id, movie.media_type as 'tv' | 'movie').then(setCast);
      }
    }
    fetchTVData();
  }, [movie]);

  // Cargar info de Episodios si cambia la Temporada
  useEffect(() => {
    async function fetchEpisodes() {
      if (movie?.media_type === 'tv' && selectedSeason) {
        const data = await getTVShowEpisodes(movie.id, selectedSeason);
        setEpisodes(data);
        if (data.length > 0) {
          setSelectedEpisode(data[0].episode_number);
        }
      }
    }
    fetchEpisodes();
  }, [selectedSeason, movie]);

  useEffect(() => {
    if (movie) {
      setTimeout(() => setIsVisible(true), 50);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "auto";
    }
  }, [movie]);

  const handleRemoveContinue = () => {
    const stored = localStorage.getItem("cinegalaxy_continue");
    if (stored) {
      const parsed: Movie[] = JSON.parse(stored);
      const filtered = parsed.filter(m => m.id !== movie?.id);
      localStorage.setItem("cinegalaxy_continue", JSON.stringify(filtered));
      onClose();
    }
  };

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 md:p-12">
      {/* Backdrop */}
      <div 
        className={clsx(
          "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={clsx(
          "relative w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] bg-surface rounded-t-xl sm:rounded-xl overflow-y-auto overflow-x-hidden shadow-[0_0_50px_rgba(139,92,246,0.2)] border border-primary/20 transition-all duration-500 ease-out",
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
        )}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 glass rounded-full text-foreground hover:text-primary hover-neon transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Videasy Player Integration */}
        <VideoPlayer 
          movieId={movie.id} 
          mediaType={movie.media_type} 
          season={selectedSeason} 
          episode={selectedEpisode} 
        />

        {/* Info Area */}
        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 md:gap-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 text-foreground">{movie.title}</h2>
            
            {/* Controles de Selección para Series */}
            {movie.media_type === 'tv' && seasons.length > 0 && (
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 mt-4 bg-surface p-3 sm:p-4 rounded-lg border border-primary/20">
                <div className="flex flex-col">
                  <label className="text-xs text-muted mb-1 font-bold">Temporada</label>
                  <select 
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="bg-background border border-primary/40 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2"
                  >
                    {seasons.map(s => (
                      <option key={s.season_number} value={s.season_number}>
                        {s.name} ({s.episode_count} eps)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs text-muted mb-1 font-bold">Episodio</label>
                  <select 
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                    className="bg-background border border-primary/40 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2"
                  >
                    {episodes.map(e => (
                      <option key={e.episode_number} value={e.episode_number}>
                        Ep {e.episode_number}: {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm mb-6">
              <span className="text-accent font-bold neon-text">{movie.match}% de coincidencia</span>
              <span className="text-muted">{movie.year}</span>
              <span className="px-2 py-0.5 border border-muted rounded text-muted uppercase text-xs">hd</span>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-foreground mb-4 leading-relaxed font-light">
              {movie.description}
            </p>
            
            {cast.length > 0 && (
              <p className="text-sm text-foreground/80 mb-4">
                <span className="text-muted font-bold mr-2">Protagonistas:</span>
                {cast.map(c => c.name).join(', ')}
              </p>
            )}
            
            <button 
              onClick={handleRemoveContinue}
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-surface/80 hover:bg-red-500/20 text-muted hover:text-red-400 border border-muted/20 hover:border-red-500/50 rounded-lg transition-all text-sm font-semibold group"
            >
              <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Marcar como Vista / Quitar
            </button>
          </div>
          
          <div className="text-sm">
            <div className="mb-3">
              <span className="text-muted font-semibold">Elenco: </span>
              <span className="text-foreground/80">{cast.length > 0 ? cast.map(c => c.name).join(', ') : 'No disponible'}</span>
            </div>
            <div className="mb-3">
              <span className="text-muted font-semibold">Géneros: </span>
              <span className="text-foreground">{movie.genre}</span>
            </div>
            <div>
              <span className="text-muted font-semibold">Rating: </span>
              <span className="text-accent font-bold">{movie.rating}/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
