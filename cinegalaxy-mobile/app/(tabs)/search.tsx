import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { searchMovies } from '../../lib/tmdb';
import PlayerModal from '../../components/PlayerModal';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const insets = useSafeAreaInsets();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    const results = await searchMovies(searchQuery);
    setSearchResults(results || []);
    setIsLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderGridView = (data: any[]) => (
    <View className="flex-row flex-wrap px-3 justify-between">
       {data.map((item, index) => (
         <TouchableOpacity
           key={`${item.id}-${index}`}
           onPress={() => setSelectedMovie(item)}
           className="w-[31%] aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a2e] mb-4"
           style={{ shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 6, elevation: 5 }}
         >
           <Image source={{ uri: item.poster_url }} className="w-full h-full" resizeMode="cover" />
           <View className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2">
              <Text className="text-white text-[10px] font-bold text-center" numberOfLines={1}>{item.title}</Text>
           </View>
         </TouchableOpacity>
       ))}
    </View>
  );

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-4 bg-[#0e0e0e] border-b border-violet-500/20">
        <Text
          className="text-white text-2xl font-black mb-3"
          style={{ textShadowColor: 'rgba(139,92,246,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}
        >
          Buscar
        </Text>
        <View className="flex-row items-center bg-white/8 rounded-2xl border border-white/10 px-3 py-1">
          <Search color="rgba(139,92,246,0.7)" size={18} />
          <TextInput
            className="flex-1 py-2 px-3 text-white text-[14px]"
            placeholder="Películas, series, anime..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="p-1.5">
              <X color="rgba(255,255,255,0.5)" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center mt-16">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-violet-400 mt-4 font-semibold">Buscando...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <View>
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest px-4 mb-3">
              {searchResults.length} resultados para "{searchQuery}"
            </Text>
            {renderGridView(searchResults)}
          </View>
        ) : hasSearched ? (
          <View className="items-center mt-16 px-10">
            <Search color="rgba(139,92,246,0.2)" size={64} />
            <Text className="text-white font-bold text-lg mt-5 mb-2">Sin resultados</Text>
            <Text className="text-zinc-500 text-center text-sm">No encontramos nada para "{searchQuery}". Intenta con otro término.</Text>
          </View>
        ) : (
          <View className="items-center mt-16 px-10">
            <View className="w-24 h-24 bg-violet-500/10 rounded-full items-center justify-center mb-5 border border-violet-500/20">
              <Search color="rgba(139,92,246,0.6)" size={40} />
            </View>
            <Text className="text-white font-bold text-xl mb-2">Descubre contenido</Text>
            <Text className="text-zinc-500 text-center text-sm leading-5">Busca tus películas, series y animes favoritos y empieza a verlos.</Text>
          </View>
        )}
      </ScrollView>

      <PlayerModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </View>
  );
}
