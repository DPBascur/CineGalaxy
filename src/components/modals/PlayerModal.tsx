"use client";

import { useEffect, useState } from "react";
import { X, Play, Plus, ThumbsUp, Volume2, CheckCircle2, ShieldAlert, SkipForward, Star, EyeOff } from "lucide-react";
import { Movie } from "@/lib/mockData";
import { getTVShowDetails, getTVShowEpisodes, getMediaCredits, SeasonInfo, EpisodeInfo, CastMember } from "@/lib/tmdb";
import VideoPlayer from "@/components/video/VideoPlayer";
import { supabase } from "@/lib/supabase";
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
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<number[]>([]);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
    });

    async function fetchReviews() {
      if (movie?.id) {
        const { data } = await supabase
          .from('cinegalaxy_reviews')
          .select('*')
          .eq('movie_id', movie.id.toString())
          .order('created_at', { ascending: false });
        if (data) setReviews(data);
      }
    }
    fetchReviews();
  }, [movie]);

  const submitReview = async () => {
    if (!newReview.trim() || !userSession || !movie) return;
    
    const reviewData = {
      user_id: userSession.user.id,
      email: userSession.user.email,
      username: userSession.user.user_metadata?.username || userSession.user.email.split('@')[0],
      movie_id: movie.id.toString(),
      rating: newRating,
      comment: newReview.trim(),
      is_spoiler: isSpoiler
    };
    
    // Optimistic update
    setReviews(prev => [{ ...reviewData, created_at: new Date().toISOString() }, ...prev]);
    setNewReview("");
    setNewRating(5);
    setIsSpoiler(false);
    
    await supabase.from('cinegalaxy_reviews').insert([reviewData]).select();
  };

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
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [movie]);

  const handleRemoveContinue = () => {
    const stored = localStorage.getItem("cinegalaxy_continue");
    if (stored) {
      const parsed: Movie[] = JSON.parse(stored);
      const filtered = parsed.filter(m => m.id !== movie?.id);
      localStorage.setItem("cinegalaxy_continue", JSON.stringify(filtered));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase.auth.updateUser({ data: { cinegalaxy_continue: filtered } });
        }
      });
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
          className="absolute top-4 left-4 z-50 p-2 glass rounded-full text-foreground hover:text-primary hover-neon transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Videasy Player Integration */}
        <VideoPlayer 
          movieId={movie.id} 
          mediaType={movie.media_type} 
          season={selectedSeason} 
          episode={selectedEpisode} 
          onPlayStart={() => {
            const stored = localStorage.getItem("cinegalaxy_continue");
            let updated = [];
            if (stored) {
              const parsed = JSON.parse(stored);
              const filtered = parsed.filter((m: any) => m.id !== movie.id);
              updated = [movie, ...filtered].slice(0, 10);
            } else {
              updated = [movie];
            }
            localStorage.setItem("cinegalaxy_continue", JSON.stringify(updated));
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session?.user) {
                supabase.auth.updateUser({ data: { cinegalaxy_continue: updated } });
              }
            });
          }}
        />

        {/* Adblock Warning Banner */}
        <div className="bg-[#1a1a1a] border-b border-[#333] px-4 py-3 sm:px-8 flex items-start gap-3 w-full">
          <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-sm text-white/70 leading-snug font-normal">
            <strong className="text-white/90">Aviso sobre publicidad:</strong> Debido al uso de servidores de terceros (VidEasy), es posible que visualices anuncios externos. Recomendamos acceder desde el navegador <strong>Brave</strong> o usar la extensión <strong>uBlock Origin</strong> para disfrutar de una experiencia limpia y sin interrupciones.
          </p>
        </div>

        {/* Info Area */}
        <div className="bg-[#141414] p-4 sm:p-8 md:p-12 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 md:gap-12">
          {/* Columna Izquierda (Info Principal) */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">{movie.title}</h2>
            
            {/* Metadatos (Match, Año, HD) */}
            <div className="flex items-center gap-3 text-sm md:text-base font-semibold mb-6 flex-wrap">
              <span className="text-[#46d369]">{movie.match}% de coincidencia</span>
              <span className="text-white/90">{movie.year}</span>
              <span className="px-1.5 py-0.5 border border-white/40 rounded-sm text-white/90 uppercase text-[10px]">hd</span>
              {(movie.adult || movie.genre?.toLowerCase().includes('hentai') || movie.genre?.toLowerCase().includes('adult') || movie.title?.toLowerCase().includes('hentai') || ['overflow', 'yosuga', 'euphoria', 'boku no', 'kaifuku', 'redo of healer'].some(t => movie.title?.toLowerCase().includes(t))) && (
                 <span className="px-2 py-0.5 bg-[#E50914] text-white rounded-sm uppercase text-[11px] font-bold shadow-[0_0_10px_rgba(229,9,20,0.6)] drop-shadow-md animate-pulse">18+ Explícito</span>
              )}
            </div>

            {/* Controles de Selección para Series */}
            {movie.media_type === 'tv' && seasons.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 max-w-[200px]">
                  <select 
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="w-full bg-[#242424] border border-white/20 text-white text-base md:text-lg rounded focus:ring-2 focus:ring-white p-3 font-semibold shadow-sm appearance-none cursor-pointer"
                  >
                    {seasons.map(s => (
                      <option key={s.season_number} value={s.season_number}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1 max-w-[340px]">
                  <select 
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                    className="w-full bg-[#242424] border border-white/20 text-white text-sm md:text-base rounded focus:ring-2 focus:ring-white p-3 shadow-sm appearance-none cursor-pointer"
                  >
                    {episodes.map(e => (
                      <option key={e.episode_number} value={e.episode_number}>
                        Episodio {e.episode_number}: {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    const currentEpIndex = episodes.findIndex(e => e.episode_number === selectedEpisode);
                    if (currentEpIndex >= 0 && currentEpIndex < episodes.length - 1) {
                      setSelectedEpisode(episodes[currentEpIndex + 1].episode_number);
                    } else {
                      const currentSeasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
                      if (currentSeasonIndex >= 0 && currentSeasonIndex < seasons.length - 1) {
                        setSelectedSeason(seasons[currentSeasonIndex + 1].season_number);
                      } else {
                        alert("Has llegado al final de la serie.");
                      }
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#242424] hover:bg-white/20 text-white border border-white/20 rounded font-bold transition-all hover:text-white group drop-shadow-md hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  title="Siguiente Episodio"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <SkipForward className="w-5 h-5 group-hover:scale-110 transition-transform text-white/90" />
                </button>
              </div>
            )}

            {/* Sinopsis */}
            <p className="text-white/90 text-sm md:text-base leading-relaxed font-normal">
              {movie.description}
            </p>
            
            {/* Acciones */}
            <div className="mt-8 flex flex-wrap items-center gap-4">

              <button 
                onClick={handleRemoveContinue}
                className="flex items-center gap-2 px-6 py-2.5 border border-white/40 hover:border-white text-white hover:bg-white/10 rounded transition-all text-sm font-semibold group"
              >
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Quitar de Mi Lista
              </button>
            </div>
          </div>
          
          {/* Columna Derecha (Cast, Genres, etc.) */}
          <div className="text-[13px] md:text-sm leading-relaxed mt-2 md:mt-16">
            <div className="mb-3 break-words">
              <span className="text-[#777777]">Elenco: </span>
              <span className="text-white hover:underline cursor-pointer">{cast.length > 0 ? cast.map(c => c.name).join(', ') : 'No disponible'}</span>
            </div>
            <div className="mb-3 break-words">
              <span className="text-[#777777]">Géneros: </span>
              <span className="text-white hover:underline cursor-pointer">{movie.genre}</span>
            </div>
            <div className="mb-3">
              <span className="text-[#777777]">Calificación: </span>
              <span className="text-white">{movie.rating}/10</span>
            </div>
          </div>
        </div>

        {/* Community Reviews Section */}
        <div className="bg-[#0f0f0f] relative p-4 sm:p-8 md:p-12 border-t border-[#333]">
          {/* Subtle bg glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary blur-[20px] opacity-20"></div>
          
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" fill="currentColor" /> 
            Reseñas Galácticas
          </h3>
          
          {userSession ? (
            <div className="mb-8 p-4 bg-[#1a1a1a] rounded-xl border border-white/5 shadow-lg">
              <p className="text-sm text-white/50 mb-2">Dejar tu opinión como <span className="text-primary font-bold">{userSession.user.email}</span></p>
              <div className="flex justify-between items-end mb-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      className={clsx("w-6 h-6 cursor-pointer hover:scale-110 transition-transform", star <= newRating ? "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" : "text-white/20")}
                      fill={star <= newRating ? "currentColor" : "none"}
                      onClick={() => setNewRating(star)}
                    />
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70 hover:text-white transition-colors select-none">
                  <input 
                    type="checkbox" 
                    checked={isSpoiler} 
                    onChange={(e) => setIsSpoiler(e.target.checked)} 
                    className="accent-primary w-4 h-4 cursor-pointer" 
                  />
                  Contiene Spoilers
                </label>
              </div>
              <textarea 
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="¿Qué te pareció este título? Déjalo para la historia..."
                className="w-full bg-[#242424] border border-white/10 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-3 min-h-[80px] transition-all scrollbar-hide"
              />
              <button 
                onClick={submitReview}
                disabled={!newReview.trim()}
                className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold text-sm transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                Enviar Reseña
              </button>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
              <p className="text-white/80 text-sm font-medium">Inicia Sesión para dejar una reseña al universo</p>
            </div>
          )}

          {/* List of Reviews */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#8B5CF6 #1a1a1a' }}>
            {reviews.length > 0 ? reviews.map((rev, i) => (
              <div key={i} className="p-5 bg-[#141414] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white flex justify-center items-center font-bold text-sm shadow-[0_0_10px_rgba(139,92,246,0.3)] shrink-0">
                    {(rev.username || rev.email)?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white/90 font-bold text-sm">{rev.username || rev.email?.split('@')[0]}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={clsx("w-3 h-3", idx < rev.rating ? "text-primary" : "text-white/10")} fill={idx < rev.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <span className="text-white/30 text-[11px] ml-auto font-medium tracking-wide">
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Justo ahora'}
                  </span>
                </div>
                {rev.is_spoiler && !revealedSpoilers.includes(i) ? (
                  <div 
                    onClick={() => setRevealedSpoilers(prev => [...prev, i])}
                    className="p-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg cursor-pointer hover:bg-black/60 transition-all text-center group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                    <EyeOff className="w-6 h-6 text-[#E50914] mx-auto mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                    <p className="text-[#E50914] font-black text-[11px] uppercase tracking-[0.2em] mb-1 drop-shadow-[0_0_8px_rgba(229,9,20,0.6)]">Spoiler Oculto</p>
                    <p className="text-white/40 text-[12px] font-medium group-hover:text-white/80 transition-colors">Toca para revelar el contenido</p>
                  </div>
                ) : (
                  <p className="text-white/80 text-sm leading-relaxed">{rev.comment}</p>
                )}
              </div>
            )) : (
              <div className="py-8 text-center bg-[#141414] rounded-xl border border-white/5 border-dashed">
                <Star className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/40 text-sm italic">Este espacio está vacío. ¡Sé el primero en dejar tu marca!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
