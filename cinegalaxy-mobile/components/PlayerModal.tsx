import React, { useEffect, useState, useCallback } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Text, ActivityIndicator, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Play, ShieldAlert, SkipForward, Star, EyeOff } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { getTVShowDetails, getTVShowEpisodes, getMediaCredits } from '../lib/tmdb';
import { Picker } from '@react-native-picker/picker';

interface PlayerModalProps {
  movie: any;
  onClose: () => void;
}

export default function PlayerModal({ movie, onClose }: PlayerModalProps) {
  const insets = useSafeAreaInsets();
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [cast, setCast] = useState<any[]>([]);

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
  }, [movie]);

  useEffect(() => {
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
    
    await supabase.from('cinegalaxy_reviews').insert([reviewData]);
  };

  // Fetch Reparto y Temporadas
  useEffect(() => {
    async function fetchTVData() {
      if (movie?.media_type === 'tv') {
        const data = await getTVShowDetails(movie.id);
        setSeasons(data || []);
        if (data && data.length > 0) {
          setSelectedSeason(data[0].season_number);
        }
      }
      // Info Cast
      if (movie?.id) {
        const castData = await getMediaCredits(movie.id, movie.media_type as 'tv' | 'movie');
        setCast(castData || []);
      }
    }
    if(movie) fetchTVData();
  }, [movie]);

  // Cargar info de Episodios si cambia la Temporada
  useEffect(() => {
    async function fetchEpisodes() {
      if (movie?.media_type === 'tv' && selectedSeason) {
        const data = await getTVShowEpisodes(movie.id, selectedSeason);
        setEpisodes(data || []);
        if (data && data.length > 0) {
          setSelectedEpisode(data[0].episode_number);
        }
      }
    }
    if(movie) fetchEpisodes();
  }, [selectedSeason, movie]);

  useEffect(() => {
      // Registrar que la vio en el continue watching!
      if(!movie) return;
      supabase.auth.getSession().then(({ data: { session } }) => {
          // Aqui iria la logica de almacenamiento en localStorage nativo si aplica.
      });
  }, [movie])

  if (!movie) return null;

  const url = movie.media_type === "tv"
    ? `https://player.videasy.net/tv/${movie.id}/${selectedSeason}/${selectedEpisode}?color=8B5CF6`
    : `https://player.videasy.net/movie/${movie.id}?color=8B5CF6`;

  const renderStars = (rating: number, interactive = false) => {
      return [1,2,3,4,5].map(star => (
          <TouchableOpacity key={star} disabled={!interactive} onPress={() => interactive && setNewRating(star)}>
            <Star size={interactive ? 24 : 14} color={star <= rating ? "#8B5CF6" : "rgba(255,255,255,0.2)"} fill={star <= rating ? "#8B5CF6" : "transparent"} />
          </TouchableOpacity>
      ));
  };

  // Script de bloqueo de anuncios refinado para no romper el iframe del video
  const adBlockScript = `
    (function() {
      // Bloquear apertura de nuevas ventanas (popups)
      window.open = function() { 
        console.log("CineGalaxy: Intento de popup bloqueado");
        return null; 
      };
      
      // Bloquear diálogos invasivos
      window.alert = function() { return true; };
      window.confirm = function() { return true; };

      const hideAds = () => {
        const adSelectors = [
          'div[style*="position: fixed"]', 
          '#pop-under',
          '.ad-container',
          'div[id*="ad"]',
          'div[class*="ad-"]'
        ];
        adSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            // Solo ocultamos elementos que tapen mucha pantalla y no sean el video
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
               el.style.display = 'none';
               el.style.pointerEvents = 'none';
               el.style.opacity = '0';
            }
          });
        });
      };

      setInterval(hideAds, 2000);
      hideAds();
    })();
  `;

  return (
    <Modal visible={!!movie} animationType="slide" transparent>
      <View className="flex-1 bg-zinc-950" style={{ paddingTop: insets.top }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          <View className="flex-row items-center justify-between p-5 pt-2.5 bg-zinc-950">
            <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>{movie.title}</Text>
            <TouchableOpacity onPress={onClose} className="p-1 bg-white/10 rounded-[20px] ml-4">
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <View className="w-full aspect-video bg-black">
            <WebView 
              source={{ uri: url }} 
              className="flex-1 bg-black"
              allowsFullscreenVideo
              javaScriptEnabled
              domStorageEnabled
              setSupportMultipleWindows={false}
              injectedJavaScript={adBlockScript}
              originWhitelist={['*']}
              onShouldStartLoadWithRequest={(request) => {
                // Permitir la carga del iframe inicial y recursos internos
                // Bloqueamos navegaciones que intenten salirse a dominios de publicidad (ej: bet365, etc)
                const isNavigatingAway = request.mainDocumentURL && !request.mainDocumentURL.includes('videasy.net');
                
                if (isNavigatingAway && !request.url.includes('videasy.net')) {
                   // Si intenta navegar a otra web fuera del reproductor, lo bloqueamos
                   return false;
                }
                
                // Permitir el resto (imágenes, scripts de CDNs, etc) para no romper el video
                return true;
              }}
              startInLoadingState
              renderLoading={() => (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                   <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
              )}
            />
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
           <View className="flex-row bg-[#1a1a1a] p-2.5 items-center border-b border-[#333]">
              <ShieldAlert color="#fb923c" size={20} />
              <Text className="text-white/70 text-xs ml-2.5">Protección activa anti pop-ups (Sandbox).</Text>
           </View>

           <View className="p-5">
              <Text className="text-[28px] font-bold text-white mb-2.5">{movie.title}</Text>
              
              <View className="flex-row items-center gap-[15px] mb-5">
                  <Text className="text-[#46d369] font-bold">{movie.match}% coincidencia</Text>
                  <Text className="text-white/80">{movie.year}</Text>
                  <View className="border border-white/40 rounded px-1"><Text className="text-white/90 text-[10px] font-bold">HD</Text></View>
              </View>

              {movie.media_type === 'tv' && seasons.length > 0 && (
                  <View className="mb-5 gap-2.5">
                      <View className="bg-[#242424] rounded-lg border border-white/20 overflow-hidden">
                          <Picker
                              selectedValue={selectedSeason}
                              style={{ color: '#fff', width: '100%', height: 50 }}
                              dropdownIconColor="#8B5CF6"
                              onValueChange={(val) => setSelectedSeason(val)}
                              mode="dropdown"
                              itemStyle={{ color: '#ffffff' }}
                          >
                              {seasons.map(s => <Picker.Item key={s.season_number} label={s.name} value={s.season_number} color="#ffffff" style={{backgroundColor: '#242424', color: '#fff'}} />)}
                          </Picker>
                      </View>

                      <View className="bg-[#242424] rounded-lg border border-white/20 overflow-hidden">
                          <Picker
                              selectedValue={selectedEpisode}
                              style={{ color: '#fff', width: '100%', height: 50 }}
                              dropdownIconColor="#8B5CF6"
                              onValueChange={(val) => setSelectedEpisode(val)}
                              mode="dropdown"
                              itemStyle={{ color: '#ffffff' }}
                          >
                              {episodes.map(e => <Picker.Item key={e.episode_number} label={`Ep. ${e.episode_number}: ${e.name}`} value={e.episode_number} color="#ffffff" style={{backgroundColor: '#242424', color: '#fff'}} />)}
                          </Picker>
                      </View>

                      <TouchableOpacity className="flex-row items-center justify-center bg-[#242424] border border-white/20 rounded-lg p-[15px] gap-2.5" onPress={() => {
                           const currentEpIndex = episodes.findIndex(e => e.episode_number === selectedEpisode);
                           if (currentEpIndex >= 0 && currentEpIndex < episodes.length - 1) {
                             setSelectedEpisode(episodes[currentEpIndex + 1].episode_number);
                           } else {
                             const currentSeasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
                             if (currentSeasonIndex >= 0 && currentSeasonIndex < seasons.length - 1) {
                               setSelectedSeason(seasons[currentSeasonIndex + 1].season_number);
                             } else {
                               Alert.alert("Fin", "Has llegado al final de la serie.");
                             }
                           }
                      }}>
                          <Text className="text-white font-bold">Siguiente</Text>
                          <SkipForward color="#fff" size={18} />
                      </TouchableOpacity>
                  </View>
              )}

              <Text className="text-white/90 text-sm leading-[22px] mb-5">{movie.description}</Text>

              <View className="mt-2.5">
                  <Text className="text-[#777] text-[13px] font-bold">Elenco:</Text>
                  <Text className="text-white text-[13px] mt-0.5">{cast.length > 0 ? cast.map(c => c.name).join(', ') : 'Desconocido'}</Text>
                  
                  <Text className="text-[#777] text-[13px] font-bold mt-2.5">Género / Votos:</Text>
                  <Text className="text-white text-[13px] mt-0.5">{movie.genre}  •  {movie.rating}/10</Text>
              </View>
           </View>

           {/* Comentarios Gremio */}
           <View className="bg-[#0f0f0f] p-5 border-t border-[#333]">
               <Text className="text-white text-xl font-bold mb-5 flex-row items-center"><Star color="#8B5CF6" fill="#8B5CF6"/> Reseñas Galácticas</Text>
               
               {userSession ? (
                   <View className="bg-[#1a1a1a] p-[15px] rounded-xl mb-5 border border-white/5">
                       <Text style={{color: '#a1a1aa', fontSize: 12, marginBottom:10}}>Dejar opinión como {userSession.user.email}</Text>
                       <View className="flex-row justify-between mb-[15px]">
                           <View style={{flexDirection: 'row', gap: 2}}>{renderStars(newRating, true)}</View>
                           <TouchableOpacity onPress={() => setIsSpoiler(!isSpoiler)} className={`flex-row items-center gap-1.5 p-1 rounded bg-white/5 ${isSpoiler ? 'bg-red-500/10' : ''}`}>
                               <ShieldAlert size={14} color={isSpoiler ? "#ef4444" : "#a1a1aa"} />
                               <Text className={`text-xs font-bold ${isSpoiler ? 'text-red-500' : 'text-zinc-400'}`}>Spoiler</Text>
                           </TouchableOpacity>
                       </View>
                       <TextInput 
                          className="bg-[#242424] rounded-lg p-[15px] text-white min-h-[80px]"
                          style={{ textAlignVertical: 'top' }}
                          placeholderTextColor="#666"
                          placeholder="¿Qué te pareció este título?"
                          value={newReview}
                          onChangeText={setNewReview}
                          multiline
                       />
                       <TouchableOpacity onPress={submitReview} disabled={!newReview.trim()} className={`bg-violet-500 p-3 rounded-lg items-center mt-2.5 ${!newReview.trim() ? 'opacity-50' : ''}`}>
                           <Text className="text-white font-bold">Enviar Reseña</Text>
                       </TouchableOpacity>
                   </View>
               ) : (
                   <Text style={{color: '#666', marginBottom: 20}}>Debes estar logueado para comentar.</Text>
               )}

               {/* Historial */}
               {reviews.map((rev, i) => (
                   <View key={i} className="bg-[#141414] p-[15px] rounded-xl mb-2.5 border border-white/5">
                       <View className="flex-row items-center mb-2.5 gap-2.5">
                           <View className="w-[35px] h-[35px] rounded-[20px] bg-violet-500 justify-center items-center"><Text className="text-white font-bold text-base">{(rev.username || rev.email)?.charAt(0).toUpperCase()}</Text></View>
                           <View style={{flex: 1}}>
                               <Text className="text-white font-bold text-sm">{rev.username || rev.email?.split('@')[0]}</Text>
                               <View style={{flexDirection:'row'}}>{renderStars(rev.rating)}</View>
                           </View>
                           <Text className="text-white/30 text-[10px]">{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'ahora'}</Text>
                       </View>

                       {rev.is_spoiler && !revealedSpoilers.includes(i) ? (
                           <TouchableOpacity onPress={() => setRevealedSpoilers(prev => [...prev, i])} className="bg-black/60 p-5 rounded-lg items-center border border-white/10">
                               <EyeOff color="#ef4444" size={24} style={{marginBottom: 5}}/>
                               <Text style={{color: '#ef4444', fontWeight:'bold', fontSize: 12}}>SPOILER OCULTO</Text>
                               <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 10}}>Toca para revelar</Text>
                           </TouchableOpacity>
                       ) : (
                           <Text className="text-white/80 text-[13px] leading-5">{rev.comment}</Text>
                       )}
                   </View>
               ))}
           </View>

        </ScrollView>
      </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
