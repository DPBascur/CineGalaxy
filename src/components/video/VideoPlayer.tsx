"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  movieId: string;
  mediaType?: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

export default function VideoPlayer({ movieId, mediaType = 'movie', season = 1, episode = 1 }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Forzar reload cuando cambian season o episode
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [movieId, season, episode]);

  // Determinar URL del iframe según tipo
  const baseUrl = mediaType === 'tv' 
    ? `https://player.videasy.net/tv/${movieId}/${season}/${episode}` 
    : `https://player.videasy.net/movie/${movieId}`;
  
  const srcUrl = `${baseUrl}?color=8B5CF6`;

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden rounded-t-xl group">
      {/* 1. Loader de precaución (mantiene tu UI) */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-sm z-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}

      {/* 2. Fallback si el Iframe rechaza la carga */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface z-20">
          <p className="text-red-400 font-semibold">Error al cargar el reproductor.</p>
        </div>
      )}

      {/* 3. Endpoint exclusivo de Embed de Videasy */}
      <iframe
        src={srcUrl}
        className="w-full h-full border-0 focus:outline-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        title={`Video Player para película ${movieId}`}
      />
    </div>
  );
}
