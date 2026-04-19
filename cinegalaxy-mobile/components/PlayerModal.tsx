import React, { useEffect, useState, useCallback } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Text, ActivityIndicator, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, Play, ShieldAlert, SkipForward, Star, EyeOff } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { getTVShowDetails, getTVShowEpisodes, getMediaCredits } from '../lib/tmdb';
import { Picker } from '@react-native-picker/picker';

interface PlayerModalProps {
  movie: any;
  onClose: () => void;
}

export default function PlayerModal({ movie, onClose }: PlayerModalProps) {
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
    ? `https://player.videasy.net/tv/${movie.id}/${selectedSeason}/${selectedEpisode}`
    : `https://player.videasy.net/movie/${movie.id}`;

  const renderStars = (rating: number, interactive = false) => {
      return [1,2,3,4,5].map(star => (
          <TouchableOpacity key={star} disabled={!interactive} onPress={() => interactive && setNewRating(star)}>
            <Star size={interactive ? 24 : 14} color={star <= rating ? "#8B5CF6" : "rgba(255,255,255,0.2)"} fill={star <= rating ? "#8B5CF6" : "transparent"} />
          </TouchableOpacity>
      ));
  };

  return (
    <Modal visible={!!movie} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{movie.title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.videoContainer}>
          <WebView 
            source={{ uri: url }} 
            style={styles.webview}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['https://*', 'http://*']}
            onShouldStartLoadWithRequest={(request) => {
              return request.url.includes('videasy.net') || request.url.includes('google');
            }}
            startInLoadingState
            renderLoading={() => (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                 <ActivityIndicator size="large" color="#8B5CF6" />
              </View>
            )}
          />
        </View>

        <ScrollView style={styles.scrollContent}>
           <View style={styles.warningBox}>
              <ShieldAlert color="#fb923c" size={20} />
              <Text style={styles.warningText}>Protección activa anti pop-ups (Sandbox).</Text>
           </View>

           <View style={styles.metadataArea}>
              <Text style={styles.movieTitle}>{movie.title}</Text>
              
              <View style={styles.badgesLine}>
                  <Text style={styles.matchText}>{movie.match}% coincidencia</Text>
                  <Text style={styles.yearText}>{movie.year}</Text>
                  <View style={styles.hdBadge}><Text style={styles.hdText}>HD</Text></View>
              </View>

              {movie.media_type === 'tv' && seasons.length > 0 && (
                  <View style={styles.seriesControls}>
                      <View style={styles.pickerContainer}>
                          <Picker
                              selectedValue={selectedSeason}
                              style={styles.picker}
                              dropdownIconColor="#8B5CF6"
                              onValueChange={(val) => setSelectedSeason(val)}
                              mode="dropdown"
                              itemStyle={{ color: '#ffffff' }}
                          >
                              {seasons.map(s => <Picker.Item key={s.season_number} label={s.name} value={s.season_number} color="#ffffff" style={{backgroundColor: '#242424', color: '#fff'}} />)}
                          </Picker>
                      </View>

                      <View style={styles.pickerContainer}>
                          <Picker
                              selectedValue={selectedEpisode}
                              style={styles.picker}
                              dropdownIconColor="#8B5CF6"
                              onValueChange={(val) => setSelectedEpisode(val)}
                              mode="dropdown"
                              itemStyle={{ color: '#ffffff' }}
                          >
                              {episodes.map(e => <Picker.Item key={e.episode_number} label={`Ep. ${e.episode_number}: ${e.name}`} value={e.episode_number} color="#ffffff" style={{backgroundColor: '#242424', color: '#fff'}} />)}
                          </Picker>
                      </View>

                      <TouchableOpacity style={styles.nextBtn} onPress={() => {
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
                          <Text style={styles.nextBtnTxt}>Siguiente</Text>
                          <SkipForward color="#fff" size={18} />
                      </TouchableOpacity>
                  </View>
              )}

              <Text style={styles.description}>{movie.description}</Text>

              <View style={styles.detailsBox}>
                  <Text style={styles.detailTitle}>Elenco:</Text>
                  <Text style={styles.detailText}>{cast.length > 0 ? cast.map(c => c.name).join(', ') : 'Desconocido'}</Text>
                  
                  <Text style={[styles.detailTitle, {marginTop: 10}]}>Género / Votos:</Text>
                  <Text style={styles.detailText}>{movie.genre}  •  {movie.rating}/10</Text>
              </View>
           </View>

           {/* Comentarios Gremio */}
           <View style={styles.reviewsArea}>
               <Text style={styles.sectionTitle}><Star color="#8B5CF6" fill="#8B5CF6"/> Reseñas Galácticas</Text>
               
               {userSession ? (
                   <View style={styles.composeBox}>
                       <Text style={{color: '#a1a1aa', fontSize: 12, marginBottom:10}}>Dejar opinión como {userSession.user.email}</Text>
                       <View style={styles.composeHeader}>
                           <View style={{flexDirection: 'row', gap: 2}}>{renderStars(newRating, true)}</View>
                           <TouchableOpacity onPress={() => setIsSpoiler(!isSpoiler)} style={[styles.spoilerBox, isSpoiler && styles.spoilerBoxActive]}>
                               <ShieldAlert size={14} color={isSpoiler ? "#ef4444" : "#a1a1aa"} />
                               <Text style={[styles.spoilerTxt, isSpoiler && {color: '#ef4444'}]}>Spoiler</Text>
                           </TouchableOpacity>
                       </View>
                       <TextInput 
                          style={styles.reviewInput}
                          placeholderTextColor="#666"
                          placeholder="¿Qué te pareció este título?"
                          value={newReview}
                          onChangeText={setNewReview}
                          multiline
                       />
                       <TouchableOpacity onPress={submitReview} disabled={!newReview.trim()} style={[styles.submitBtn, !newReview.trim() && {opacity: 0.5}]}>
                           <Text style={styles.submitBtnTxt}>Enviar Reseña</Text>
                       </TouchableOpacity>
                   </View>
               ) : (
                   <Text style={{color: '#666', marginBottom: 20}}>Debes estar logueado para comentar.</Text>
               )}

               {/* Historial */}
               {reviews.map((rev, i) => (
                   <View key={i} style={styles.reviewCard}>
                       <View style={styles.reviewHeader}>
                           <View style={styles.avatar}><Text style={styles.avatarTxt}>{(rev.username || rev.email)?.charAt(0).toUpperCase()}</Text></View>
                           <View style={{flex: 1}}>
                               <Text style={styles.reviewerName}>{rev.username || rev.email?.split('@')[0]}</Text>
                               <View style={{flexDirection:'row'}}>{renderStars(rev.rating)}</View>
                           </View>
                           <Text style={styles.reviewDate}>{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'ahora'}</Text>
                       </View>

                       {rev.is_spoiler && !revealedSpoilers.includes(i) ? (
                           <TouchableOpacity onPress={() => setRevealedSpoilers(prev => [...prev, i])} style={styles.hiddenSpoiler}>
                               <EyeOff color="#ef4444" size={24} style={{marginBottom: 5}}/>
                               <Text style={{color: '#ef4444', fontWeight:'bold', fontSize: 12}}>SPOILER OCULTO</Text>
                               <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 10}}>Toca para revelar</Text>
                           </TouchableOpacity>
                       ) : (
                           <Text style={styles.reviewText}>{rev.comment}</Text>
                       )}
                   </View>
               ))}
           </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#09090b',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeBtn: {
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    marginLeft: 15,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#333'
  },
  warningText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 10
  },
  metadataArea: {
    padding: 20,
  },
  movieTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10
  },
  badgesLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20
  },
  matchText: { color: '#46d369', fontWeight: 'bold' },
  yearText: { color: 'rgba(255,255,255,0.8)' },
  hdBadge: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 4, paddingHorizontal: 4 },
  hdText: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 'bold' },
  seriesControls: {
    marginBottom: 20,
    gap: 10
  },
  pickerContainer: {
    backgroundColor: '#242424',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden'
  },
  picker: {
    color: '#fff',
    width: '100%',
    height: 50
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 15,
    gap: 10
  },
  nextBtnTxt: { color: '#fff', fontWeight: 'bold' },
  description: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  detailsBox: { marginTop: 10 },
  detailTitle: { color: '#777', fontSize: 13, fontWeight: 'bold' },
  detailText: { color: '#fff', fontSize: 13, marginTop: 2 },
  reviewsArea: {
    backgroundColor: '#0f0f0f',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#333'
  },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  composeBox: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  composeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  spoilerBox: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.05)' },
  spoilerBoxActive: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  spoilerTxt: { color: '#a1a1aa', fontSize: 12, fontWeight: 'bold' },
  reviewInput: { backgroundColor: '#242424', borderRadius: 8, padding: 15, color: '#fff', minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#8B5CF6', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitBtnTxt: { color: '#fff', fontWeight: 'bold' },
  reviewCard: { backgroundColor: '#141414', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  avatar: { width: 35, height: 35, borderRadius: 20, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  reviewerName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  reviewDate: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
  reviewText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20 },
  hiddenSpoiler: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 20, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }
});
