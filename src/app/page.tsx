"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import { SpaceParticles } from "@/components/layout/SpaceParticles";
import MovieRow from "@/components/catalog/MovieRow";
import PlayerModal from "@/components/modals/PlayerModal";
import AuthModal from "@/components/auth/AuthModal";
import SplashScreen from "@/components/layout/SplashScreen";
import { Movie, mockMovies } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";
import { getTrendingMovies, getTopRatedMovies, getPopularMovies, searchMovies, getPopularTV, getMediaByGenre, getAnimeShows } from "@/lib/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

function MainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query");
  const tabParam = searchParams.get("tab");
  const randomParam = searchParams.get("random");

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState("Populares");
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab("Populares");
    }
  }, [tabParam]);
  
  // Categorías
  const tabs = ["Populares", "Películas", "Series", "Anime", "Acción", "Animación", "Terror"];

  // States
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Movie[]>([]);
  const [genreData, setGenreData] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Leer estado de localstorage y supabase en el mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata?.cinegalaxy_continue) {
        setContinueWatching(session.user.user_metadata.cinegalaxy_continue);
        localStorage.setItem("cinegalaxy_continue", JSON.stringify(session.user.user_metadata.cinegalaxy_continue));
      } else {
        const stored = localStorage.getItem("cinegalaxy_continue");
        if (stored) {
          try {
            setContinueWatching(JSON.parse(stored));
          } catch (e) {}
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.user_metadata?.cinegalaxy_continue) {
        setContinueWatching(session.user.user_metadata.cinegalaxy_continue);
        localStorage.setItem("cinegalaxy_continue", JSON.stringify(session.user.user_metadata.cinegalaxy_continue));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlayMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  // Callback por si la borra el usuario u ocurren cambios en el modal
  const refreshContinueWatching = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata?.cinegalaxy_continue) {
        setContinueWatching(session.user.user_metadata.cinegalaxy_continue);
      } else {
        const stored = localStorage.getItem("cinegalaxy_continue");
        if (stored) {
          setContinueWatching(JSON.parse(stored));
        } else {
          setContinueWatching([]);
        }
      }
    });
  };

  const handleRemoveFromRow = (movie: Movie) => {
    setContinueWatching(prev => {
      const updated = prev.filter(m => m.id !== movie.id);
      localStorage.setItem("cinegalaxy_continue", JSON.stringify(updated));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase.auth.updateUser({ data: { cinegalaxy_continue: updated } });
        }
      });
      return updated;
    });
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (query) {
        const results = await searchMovies(query);
        setSearchResults(results);
        setHeroMovie(results[0] || null);
      } else {
        const [trendData, popData, tvData, animeData] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getPopularTV(),
          getAnimeShows()
        ]);
        setTrending(trendData);
        setPopular(popData);
        setSeries(tvData);
        setAnime(animeData);

        if (randomParam === '1') {
          const allMovies = [...trendData, ...popData, ...tvData, ...animeData];
          if (allMovies.length > 0) {
            const randomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
            setSelectedMovie(randomMovie);
            setHeroMovie(randomMovie);
          }
          // Remove parameter without reloading
          router.replace('/');
        } else {
          setHeroMovie(trendData[0] || mockMovies[0]);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [query, randomParam, router]);

  // Carousel Automático para el Home
  useEffect(() => {
    if (trending.length > 0 && !selectedMovie && !query) {
      const interval = setInterval(() => {
        setHeroMovie((currentKey) => {
          if (!currentKey) return trending[0];
          const currentIndex = trending.findIndex(m => m.id === currentKey.id);
          const nextIndex = (currentIndex + 1) % trending.length;
          return trending[nextIndex];
        });
      }, 7000); // 7 seconds
      return () => clearInterval(interval);
    }
  }, [trending, selectedMovie, query]);

  // Cargar géneros dinámicamente según la pestaña seleccionada
  useEffect(() => {
    async function loadGenre() {
      if (activeTab === "Acción") {
        setGenreData(await getMediaByGenre(28));
      } else if (activeTab === "Animación") {
        setGenreData(await getMediaByGenre(16));
      } else if (activeTab === "Terror") {
        setGenreData(await getMediaByGenre(27));
      }
    }
    loadGenre();
  }, [activeTab]);

  if (isLoading && !trending.length && !searchResults.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {heroMovie && <HeroBanner movie={heroMovie} onPlay={handlePlayMovie} />}

      <div className="relative z-10 -mt-8 sm:-mt-16 md:-mt-24 bg-gradient-to-t from-background via-background to-transparent pb-20 min-h-screen overflow-hidden">
        <SpaceParticles id="home-stars" />
        
        {query ? (
          <div className="px-4 md:px-12 mt-12">
            <h2 className="text-3xl font-bold mb-4">
              Resultados para: <span className="text-primary neon-text">{query}</span>
            </h2>
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-6xl mb-4">🛸</span>
                <p className="text-2xl text-muted font-bold">Mmm lo sentimos, no tenemos lo que buscas.</p>
                <p className="text-muted/60 mt-2">Intenta usar otras palabras clave o busca en otras galaxias.</p>
              </div>
            ) : (
              <MovieRow 
                title="Búsquedas Exitosas" 
                movies={searchResults} 
                onMovieSelect={handlePlayMovie} 
              />
            )}
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="px-4 md:px-12 mb-8 flex gap-4 overflow-x-auto scrollbar-hide py-2"
            >
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-semibold border",
                    activeTab === tab 
                      ? "bg-primary text-foreground border-primary shadow-[0_0_15px_rgba(139,92,246,0.5)] transform scale-105" 
                      : "glass-panel text-muted hover:text-foreground border-transparent hover:border-primary/50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {activeTab === "Populares" && (
                  <>
                    {continueWatching.length > 0 && (
                      <MovieRow title="Seguir Viendo" movies={continueWatching} onMovieSelect={handlePlayMovie} onRemoveItem={handleRemoveFromRow} delay={0.0} />
                    )}
                    <MovieRow title="Tendencias Globales" movies={trending.slice(0, 10)} onMovieSelect={handlePlayMovie} delay={0.1} isTop10={true} />
                    <MovieRow title="Series Destacadas" movies={series} onMovieSelect={handlePlayMovie} delay={0.2} />
                    <MovieRow title="Lo Más Visto en Cine" movies={popular} onMovieSelect={handlePlayMovie} delay={0.3} />
                    <MovieRow title="Nuevos Episodios Anime" movies={anime} onMovieSelect={handlePlayMovie} delay={0.4} />
                  </>
                )}
                {activeTab === "Películas" && (
                  <MovieRow title="Películas Destacadas" movies={popular} onMovieSelect={handlePlayMovie} delay={0.1} />
                )}
                {activeTab === "Series" && (
                  <MovieRow title="Series Top (TV)" movies={series} onMovieSelect={handlePlayMovie} delay={0.1} />
                )}
                {activeTab === "Anime" && (
                  <MovieRow title="Top Anime Japonés" movies={anime} onMovieSelect={handlePlayMovie} delay={0.1} />
                )}
                {["Acción", "Animación", "Terror"].includes(activeTab) && (
                  <MovieRow title={`Explorar ${activeTab}`} movies={genreData} onMovieSelect={handlePlayMovie} delay={0.1} />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
      
      <Footer />

      <PlayerModal 
        movie={selectedMovie} 
        onClose={() => {
          setSelectedMovie(null);
          refreshContinueWatching();
        }} 
      />
    </>
  );
}

export default function Home() {
  const [session, setSession] = useState<any>(undefined); // undefined indica carga, null indica no logueado
  const [introFinished, setIntroFinished] = useState(true);

  useEffect(() => {
    let deviceId = localStorage.getItem('cinegalaxy_device_id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('cinegalaxy_device_id', deviceId);
    }

    let channel: any = null;

    const setupRealtime = (user: any) => {
      if (!user) return;
      channel = supabase.channel(`device_sync_${user.id}`);
      
      channel
        .on('broadcast', { event: 'new_login' }, (payload: any) => {
          if (payload.payload?.deviceId && payload.payload.deviceId !== deviceId) {
            alert("Tu cuenta ha sido abierta en otro dispositivo. Cerrando sesión aquí por seguridad.");
            supabase.auth.signOut();
          }
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            channel.send({ type: 'broadcast', event: 'new_login', payload: { deviceId } });
          }
        });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && !sessionStorage.getItem('cinegalaxy_intro_played')) {
        setIntroFinished(false);
      }
      if (session?.user) setupRealtime(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && !sessionStorage.getItem('cinegalaxy_intro_played')) {
        setIntroFinished(false);
      }
      if (session?.user) {
        if (!channel) setupRealtime(session.user);
      } else {
        if (channel) {
          channel.unsubscribe();
          channel = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (channel) channel.unsubscribe();
    };
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('cinegalaxy_intro_played', 'true');
    setIntroFinished(true);
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (session === null) {
    return (
      <main className="min-h-screen bg-background relative selection:bg-primary/30 flex items-center justify-center">
        <AuthModal />
      </main>
    );
  }

  if (!introFinished) {
    return <SplashScreen onComplete={handleIntroComplete} />;
  }

  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/30">
      <Suspense fallback={<div className="min-h-screen flex bg-background items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
        <MainContent />
      </Suspense>
    </main>
  );
}
