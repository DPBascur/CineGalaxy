import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet, Text, ImageBackground, TouchableOpacity, Image, Animated, TextInput, Platform, Dimensions, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTrendingMovies, getPopularMovies, getPopularTV, getAnimeShows, searchMovies, getMediaByGenre } from '../lib/tmdb';
import MovieRow from '../components/MovieRow';
import PlayerModal from '../components/PlayerModal';
import PasswordModal from '../components/PasswordModal';
import SplashScreen from '../components/SplashScreen';
import { supabase } from '../lib/supabase';
import { Play, Search, Menu, X, Settings, Key, LogOut } from 'lucide-react-native';
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
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [heroMovie, setHeroMovie] = useState<any>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  // Search & Nav State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [gridData, setGridData] = useState<any[]>([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  
  const translateX = useRef(new Animated.Value(width)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function load() {
      try {
        const played = await AsyncStorage.getItem('cinegalaxy_intro_played');
        if (played) setIntroFinished(true);

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
        
        const cwRaw = await AsyncStorage.getItem('cinegalaxy_continue_watching');
        if (cwRaw) setContinueWatching(JSON.parse(cwRaw));

        if (trendData && trendData.length > 0) {
          setHeroMovie(trendData[0]);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserSession(session);
          const email = session.user.email;
          const role = session.user.user_metadata?.role;
          const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || "";
          if ((email && email === adminEmail) || role === "admin") {
            setIsAdmin(true);
          }
        }
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
       const cwRaw = await AsyncStorage.getItem('cinegalaxy_continue_watching');
       const cwList = cwRaw ? JSON.parse(cwRaw) : [];
       
       const newList = [movie, ...cwList.filter((m: any) => m.id !== movie.id)].slice(0, 15);
       await AsyncStorage.setItem('cinegalaxy_continue_watching', JSON.stringify(newList));
       setContinueWatching(newList);
     } catch (e) {
       console.error("Error saving continue watching:", e);
     }
  };

  const removeFromContinueWatching = async (movie: any) => {
     try {
       const newList = continueWatching.filter((m: any) => m.id !== movie.id);
       await AsyncStorage.setItem('cinegalaxy_continue_watching', JSON.stringify(newList));
       setContinueWatching(newList);
     } catch (e) {
       console.error("Error removing continue watching:", e);
     }
  };

  const handleOpenMovie = (movie: any) => {
      setSelectedMovie(movie);
      saveToContinueWatching(movie);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    const results = await searchMovies(searchQuery);
    setSearchResults(results || []);
    setIsLoading(false);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
    Animated.timing(translateX, {
      toValue: open ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (!introFinished) {
    return <SplashScreen onComplete={() => {
        AsyncStorage.setItem('cinegalaxy_intro_played', 'true');
        setIntroFinished(true);
    }}/>;
  }

  const renderGridView = (data: any[]) => (
    <View style={styles.gridContainer}>
       {data.map((item, index) => (
         <TouchableOpacity key={`${item.id}-${index}`} onPress={() => handleOpenMovie(item)} style={styles.gridCard}>
           <Image source={{ uri: item.poster_url }} style={styles.gridPoster} />
           <View style={styles.gridOverlay}>
              <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
           </View>
         </TouchableOpacity>
       ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {heroMovie && searchResults.length === 0 && activeCategory === 'popular' && (
          <ImageBackground source={{ uri: heroMovie.poster_url }} style={styles.heroBanner}>
            <View style={[styles.heroOverlay, { paddingTop: insets.top + 10 }]}>
               <View style={styles.navbar}>
                 <View style={styles.logoArea}>
                   <Image source={require('../assets/images/icon.png')} style={styles.logoIcon} />
                   <Text style={styles.logo}>CineGalaxy</Text>
                 </View>
                 
                 <View style={styles.navRight}>
                   {isSearching ? (
                      <View style={styles.navbarSearchBox}>
                         <TextInput 
                           style={styles.navSearchInput}
                           placeholder="Buscar..."
                           placeholderTextColor="rgba(255,255,255,0.5)"
                           value={searchQuery}
                           onChangeText={setSearchQuery}
                           onSubmitEditing={handleSearch}
                           autoFocus
                         />
                         <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); setSearchResults([]); }} style={styles.navSearchIcon}>
                            <X color="#fff" size={20} />
                         </TouchableOpacity>
                      </View>
                   ) : (
                      <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.menuIcon}>
                        <Search color="#fff" size={24} />
                      </TouchableOpacity>
                   )}
                   
                   {!isSearching && (
                     <TouchableOpacity onPress={() => toggleDrawer(true)} style={styles.menuIcon}>
                       <Menu color="#fff" size={28} />
                     </TouchableOpacity>
                   )}
                 </View>
               </View>

               <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>{heroMovie.title}</Text>
                  <TouchableOpacity onPress={() => handleOpenMovie(heroMovie)} style={styles.playBtn}>
                    <Play fill="#fff" color="#fff" size={20} />
                    <Text style={styles.playTxt}>Reproducir</Text>
                  </TouchableOpacity>
               </View>
            </View>
          </ImageBackground>
        )}

        {/* Minimal Nav if Banner is Hidden */}
        {(searchResults.length > 0 || activeCategory !== 'popular') && (
           <View style={[styles.navbarStatic, { paddingTop: insets.top + 10 }]}>
                 <View style={styles.logoArea}>
                   <Image source={require('../assets/images/icon.png')} style={styles.logoIcon} />
                   <Text style={styles.logo}>CineGalaxy</Text>
                 </View>
                 
                 <View style={styles.navRight}>
                   {isSearching ? (
                      <View style={styles.navbarSearchBox}>
                         <TextInput 
                           style={styles.navSearchInput}
                           placeholder="Buscar..."
                           placeholderTextColor="rgba(255,255,255,0.5)"
                           value={searchQuery}
                           onChangeText={setSearchQuery}
                           onSubmitEditing={handleSearch}
                           autoFocus
                         />
                         <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); setSearchResults([]); setActiveCategory('popular'); }} style={styles.navSearchIcon}>
                            <X color="#fff" size={20} />
                         </TouchableOpacity>
                      </View>
                   ) : (
                      <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.menuIcon}>
                        <Search color="#fff" size={24} />
                      </TouchableOpacity>
                   )}
                   {!isSearching && (
                     <TouchableOpacity onPress={() => toggleDrawer(true)} style={styles.menuIcon}>
                       <Menu color="#fff" size={28} />
                     </TouchableOpacity>
                   )}
                 </View>
           </View>
        )}

        {/* Categories Pills */}
        {searchResults.length === 0 && (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat.id} 
                    onPress={() => handleCategorySelect(cat)}
                    style={[styles.catPill, activeCategory === cat.id.toString() && styles.catPillActive]}
                  >
                    <Text style={[styles.catPillTxt, activeCategory === cat.id.toString() && styles.catPillTxtActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
        )}

        {searchResults.length > 0 && (
          <View style={[styles.searchHeader, { marginTop: 20 }]}>
            <Text style={styles.searchTitle}>Resultados para "{searchQuery}"</Text>
            <TouchableOpacity onPress={() => {setSearchResults([]); setSearchQuery(''); setIsSearching(false);}} style={styles.clearBtn}><Text style={{color: '#fff'}}>Limpiar</Text></TouchableOpacity>
          </View>
        )}

        {isLoading ? (
           <ActivityIndicator size="large" color="#8B5CF6" style={{marginTop: 50}} />
        ) : searchResults.length > 0 ? (
           <View style={{paddingVertical: 10}}>{renderGridView(searchResults)}</View>
        ) : activeCategory !== 'popular' ? (
           <View style={{paddingVertical: 10}}>
              {gridData.length > 0 ? renderGridView(gridData) : <Text style={{color: '#fff', textAlign:'center', marginTop: 30}}>No hay contenido.</Text>}
           </View>
        ) : (
           <View style={styles.content}>
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

      {/* Drawer OffCanvas */}
      {drawerOpen && (
        <TouchableOpacity activeOpacity={1} style={styles.drawerBackdrop} onPress={() => toggleDrawer(false)} />
      )}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <View style={[styles.drawerContent, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity onPress={() => toggleDrawer(false)} style={styles.closeDrawerBtn}>
            <X color="#fff" size={28} />
          </TouchableOpacity>
          
          <Text style={styles.drawerSubtitle}>Cuenta Principal</Text>
          <Text style={styles.drawerUsername}>{userSession?.user?.user_metadata?.username || userSession?.user?.email?.split('@')[0] || "Invitado"}</Text>
          <Text style={styles.drawerEmail}>{userSession?.user?.email}</Text>
          <View style={styles.separator} />
          
          <View style={styles.drawerActions}>
            {isAdmin && (
              <TouchableOpacity onPress={() => { toggleDrawer(false); router.push('/admin'); }} style={styles.drawerCard}>
                <Settings color="#8B5CF6" size={20} />
                <Text style={styles.drawerCardTxt}>Panel Maestro (Admin)</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => { toggleDrawer(false); setPasswordModalOpen(true); }} style={styles.drawerCard}>
              <Key color="#8B5CF6" size={20} />
              <Text style={styles.drawerCardTxt}>Cambiar Contraseña</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={[styles.drawerCard, {backgroundColor: 'rgba(239, 68, 68, 0.1)'}]}>
              <LogOut color="#ef4444" size={20} />
              <Text style={[styles.drawerCardTxt, {color: '#ef4444'}]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legalSection}>
             <Text style={styles.legalTitle}>Acerca de CineGalaxy</Text>
             <Text style={styles.legalText}>
               CineGalaxy es un proveedor de servicios de streaming gratuito. No almacenamos ningún archivo en nuestros servidores. Todo el contenido es provisto por terceros no afiliados. Por favor, reporta cualquier infracción de derechos de autor con las partes correspondientes.
             </Text>
          </View>
        </View>
      </Animated.View>

      <PlayerModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      {passwordModalOpen && <PasswordModal onClose={() => setPasswordModalOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  center: { justifyContent: 'center', alignItems: 'center' },
  heroBanner: { width: '100%', height: 450 },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'space-between' },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center' },
  navbarStatic: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center', paddingBottom: 10, backgroundColor: '#141414', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { width: 32, height: 32, borderRadius: 6 },
  logo: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  menuIcon: { padding: 5 },
  navbarSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', width: 180 },
  navSearchInput: { flex: 1, paddingVertical: 6, paddingHorizontal: 12, color: '#fff', fontSize: 13 },
  navSearchIcon: { padding: 6, opacity: 0.8 },
  heroContent: { padding: 20, paddingBottom: 50, alignItems: 'center' },
  heroTitle: { color: '#fff', fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 20, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 10 },
  playBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingVertical: 12, paddingHorizontal: 35, borderRadius: 30, gap: 10, shadowColor: '#8B5CF6', shadowOpacity: 0.5, shadowOffset: { width:0, height:0 }, shadowRadius: 10 },
  playTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  categoryScroll: { paddingHorizontal: 15, paddingVertical: 15, gap: 10 },
  catPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#141414', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  catPillActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6', shadowColor: '#8B5CF6', shadowOpacity: 0.4, shadowOffset: { width:0, height:0 }, shadowRadius: 8 },
  catPillTxt: { color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: 13 },
  catPillTxtActive: { color: '#fff' },
  content: { marginTop: 10, zIndex: 10 },
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  searchTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1 },
  clearBtn: { padding: 6, backgroundColor: 'rgba(239, 68, 68, 0.3)', borderRadius: 8, paddingHorizontal: 15 },
  // GRID
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, justifyContent: 'space-between' },
  gridCard: { width: '31%', aspectRatio: 2/3, borderRadius: 8, overflow: 'hidden', backgroundColor: '#1f1f2e', marginBottom: 15 },
  gridPoster: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridOverlay: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.7)', padding: 5 },
  gridTitle: { color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  // DRAWER
  drawerBackdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 40 },
  drawer: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 280, backgroundColor: '#141414', borderLeftWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 50, shadowColor: '#000', shadowOffset: { width:-5, height:0 }, shadowOpacity: 0.5, shadowRadius: 20 },
  drawerContent: { padding: 20 },
  closeDrawerBtn: { alignSelf: 'flex-end', marginBottom: 20, padding: 5 },
  drawerSubtitle: { color: '#a1a1aa', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  drawerUsername: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  drawerEmail: { color: '#8B5CF6', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  drawerActions: { gap: 10 },
  drawerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 10, gap: 12 },
  drawerCardTxt: { color: '#fff', fontWeight: 'bold' },
  legalSection: { marginTop: 30, padding: 15, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 10 },
  legalTitle: { color: '#a1a1aa', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  legalText: { color: '#666', fontSize: 10, lineHeight: 14 }
});
