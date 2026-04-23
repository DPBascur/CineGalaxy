"use client";

import { useState, useEffect, useRef } from "react";
import Lottie from "@/components/ui/LottieClient";
import loadingAnimation from "../../../public/animations/Loading.json";

interface VideoPlayerProps {
  movieId: string;
  mediaType?: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onPlayStart?: () => void;
}

export default function VideoPlayer({ movieId, mediaType = 'movie', season = 1, episode = 1, onPlayStart }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Forzar reload cuando cambian season o episode
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [movieId, season, episode]);

  // Detector mágico de Play en Iframe
  useEffect(() => {
    let fired = false;
    const handleBlur = () => {
      setTimeout(() => {
        if (!fired && document.activeElement === iframeRef.current) {
          fired = true;
          if (onPlayStart) onPlayStart();
        }
      }, 50);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [onPlayStart, movieId, season, episode]);

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
          <Lottie animationData={loadingAnimation} loop={true} className="w-24 h-24" />
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
        ref={iframeRef}
        src={srcUrl}
        className="w-full h-full border-0 focus:outline-none bg-transparent"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
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
