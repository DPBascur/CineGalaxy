import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Text, ImageBackground, TouchableOpacity, Image, Platform, Dimensions, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTrendingMovies, getPopularMovies, getPopularTV, getAnimeShows, getMediaByGenre } from '../../lib/tmdb';
import MovieRow from '../../components/MovieRow';
import PlayerModal from '../../components/PlayerModal';
import SplashScreen from '../../components/SplashScreen';
import { supabase } from '../../lib/supabase';
import { Play, Search } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'popular', name: 'Populares', type: 'collection' },
  { id: 'movie', name: 'Películas', type: 'collection' },
  { id: 'tv', name: 'Series', type: 'collection' },
  { id: 'anime', name: 'Anime', type: 'collection' },
  { id: 28, name: 'Acción', type: 'genre', media: 'movie' },
  { id: 16, name: 'Animación', type: 'genre', media: 'movie' },
  { id: 27, name: 'Terror', type: 'genre', media: 'movie' }
];

export default function HomeScreen() {
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [anime, setAnime] = useState<any[]>([]);
  const [categoryDataCache, setCategoryDataCache] = useState<Record<string, any[]>>({});
  
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [userSession, setUserSession] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const [activeCategory, setActiveCategory] = useState('popular');
  const [gridData, setGridData] = useState<any[]>([]);
  
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function load() {
      try {
        const played = await AsyncStorage.getItem('cinegalaxy_intro_played');
        if (played) setIntroFinished(true);

        const { data: { session } } = await supabase.auth.getSession();
        let currentUserId = "invitado";

        if (session) {
          setUserSession(session);
          currentUserId = session.user.id;
        }

        const [trendData, popData, tvData, animeData] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getPopularTV(),
          getAnimeShows()
        ]);
        
        setTrending(trendData || []);
        setPopular(popData || []);
        setSeries(tvData || []);
        setAnime(animeData || []);
        
        if (trendData && trendData.length > 0) {
          setHeroMovie(trendData[0]);
        }

        const cwKey = `cinegalaxy_continue_watching_${currentUserId}`;
        const cwRaw = await AsyncStorage.getItem(cwKey);
        if (cwRaw) setContinueWatching(JSON.parse(cwRaw));

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const saveToContinueWatching = async (movie: any) => {
     try {
       const userId = userSession?.user?.id || "invitado";
       const cwKey = `cinegalaxy_continue_watching_${userId}`;
       const cwRaw = await AsyncStorage.getItem(cwKey);
       const cwList = cwRaw ? JSON.parse(cwRaw) : [];
       
       const newList = [movie, ...cwList.filter((m: any) => m.id !== movie.id)].slice(0, 15);
       await AsyncStorage.setItem(cwKey, JSON.stringify(newList));
       setContinueWatching(newList);
     } catch (e) {
       console.error("Error saving continue watching:", e);
     }
  };

  const removeFromContinueWatching = async (movie: any) => {
     try {
       const userId = userSession?.user?.id || "invitado";
       const cwKey = `cinegalaxy_continue_watching_${userId}`;
       const newList = continueWatching.filter((m: any) => m.id !== movie.id);
       await AsyncStorage.setItem(cwKey, JSON.stringify(newList));
       setContinueWatching(newList);
     } catch (e) {
       console.error("Error removing continue watching:", e);
     }
  };

  const handleOpenMovie = (movie: any) => {
      setSelectedMovie(movie);
      saveToContinueWatching(movie);
  };

  const handleCategorySelect = async (cat: any) => {
    setActiveCategory(cat.id.toString());
    if (cat.id === 'popular') {
      setGridData([]);
      return;
    }

    setIsLoading(true);
    if (categoryDataCache[cat.id.toString()]) {
       setGridData(categoryDataCache[cat.id.toString()]);
       setIsLoading(false);
       return;
    }

    let data;
    if (cat.id === 'movie') data = await getPopularMovies();
    else if (cat.id === 'tv') data = await getPopularTV();
    else if (cat.id === 'anime') data = await getAnimeShows();
    else data = await getMediaByGenre(cat.id, cat.media === 'tv');

    setCategoryDataCache(prev => ({...prev, [cat.id.toString()]: data}));
    setGridData(data || []);
    setIsLoading(false);
  };

  if (!introFinished) {
    return <SplashScreen onComplete={() => {
        AsyncStorage.setItem('cinegalaxy_intro_played', 'true');
        setIntroFinished(true);
    }}/>;
  }

  const renderGridView = (data: any[]) => (
    <View className="flex-row flex-wrap px-2.5 justify-between">
       {data.map((item, index) => (
         <TouchableOpacity key={`${item.id}-${index}`} onPress={() => handleOpenMovie(item)} className="w-[31%] aspect-[2/3] rounded-lg overflow-hidden bg-[#1f1f2e] mb-4">
           <Image source={{ uri: item.poster_url }} className="w-full h-full object-cover" />
           <View className="absolute bottom-0 w-full bg-black/70 p-1.5">
              <Text className="text-white text-[10px] font-bold text-center" numberOfLines={1}>{item.title}</Text>
           </View>
         </TouchableOpacity>
       ))}
    </View>
  );

  return (
    <View className="flex-1 bg-zinc-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {heroMovie && activeCategory === 'popular' && (
          <ImageBackground source={{ uri: heroMovie.poster_url }} className="w-full h-[450px]">
            <View className="flex-1 bg-black/50 justify-between" style={{ paddingTop: insets.top + 10 }}>
               <View className="flex-row justify-between px-4 items-center">
                 <View className="flex-row items-center gap-2">
                   <Image source={require('../../assets/images/icon.png')} className="w-8 h-8 rounded-md" />
                   <Text className="text-white text-xl font-bold">CineGalaxy</Text>
                 </View>
                 
                 <View className="flex-row items-center gap-2.5">
                    <TouchableOpacity onPress={() => router.push('/search')} className="p-1.5">
                      <Search color="#fff" size={24} />
                    </TouchableOpacity>
                 </View>
               </View>

               <View className="p-5 pb-[50px] items-center">
                  <Text 
                    className="text-white text-4xl font-black text-center mb-5"
                    style={{ textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 10 }}
                  >
                    {heroMovie.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleOpenMovie(heroMovie)} className="flex-row items-center bg-violet-500 py-3 px-[35px] rounded-[30px] gap-2.5 shadow-lg shadow-violet-500/50">
                    <Play fill="#fff" color="#fff" size={20} />
                    <Text className="text-white font-bold text-base">Reproducir</Text>
                  </TouchableOpacity>
               </View>
            </View>
          </ImageBackground>
        )}

        {/* Minimal Nav if Banner is Hidden */}
        {activeCategory !== 'popular' && (
           <View className="flex-row justify-between px-4 items-center pb-2.5 bg-[#141414] border-b border-white/10" style={{ paddingTop: insets.top + 10 }}>
                 <View className="flex-row items-center gap-2">
                   <Image source={require('../../assets/images/icon.png')} className="w-8 h-8 rounded-md" />
                   <Text className="text-white text-xl font-bold">CineGalaxy</Text>
                 </View>
                 
                 <View className="flex-row items-center gap-2.5">
                    <TouchableOpacity onPress={() => router.push('/search')} className="p-1.5">
                      <Search color="#fff" size={24} />
                    </TouchableOpacity>
                 </View>
           </View>
        )}

        {/* Categories Pills */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 10 }}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id.toString();
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleCategorySelect(cat)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    backgroundColor: isActive ? '#8B5CF6' : '#141414',
                    borderColor: isActive ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isActive ? '#fff' : 'rgba(255,255,255,0.7)' }}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
           <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 50 }} />
        ) : activeCategory !== 'popular' ? (
           <View className="py-2.5">
              {gridData.length > 0 ? renderGridView(gridData) : <Text className="text-white text-center mt-[30px]">No hay contenido.</Text>}
           </View>
        ) : (
           <View className="mt-2.5 z-10">
             {continueWatching.length > 0 && (
                <MovieRow 
                   title="Continuar Viendo" 
                   movies={continueWatching} 
                   onMovieSelect={handleOpenMovie} 
                   onRemove={removeFromContinueWatching} 
                />
             )}
             <MovieRow title="Tendencias Globales" movies={trending} onMovieSelect={handleOpenMovie} isTop10 />
             <MovieRow title="Películas Extraordinarias" movies={popular} onMovieSelect={handleOpenMovie} />
             <MovieRow title="Series Destacadas" movies={series} onMovieSelect={handleOpenMovie} />
             <MovieRow title="Nuevos Episodios Anime" movies={anime} onMovieSelect={handleOpenMovie} />
           </View>
        )}
      </ScrollView>

      <PlayerModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </View>
  );
}
