import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';

import { X } from 'lucide-react-native';

interface MovieRowProps {
  title: string;
  movies: any[];
  onMovieSelect: (movie: any) => void;
  isTop10?: boolean;
  onRemove?: (movie: any) => void;
}

export default function MovieRow({ title, movies, onMovieSelect, isTop10, onRemove }: MovieRowProps) {
  if (!movies || movies.length === 0) return null;

  const displayMovies = isTop10 ? movies.slice(0, 10) : movies;

  return (
    <View className="my-[15px]">
      <Text 
        className="text-white text-xl font-bold ml-[15px] mb-2.5"
        style={{ textShadowColor: 'rgba(139,92,246,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}
      >
        {title}
      </Text>
      <FlatList 
        horizontal
        data={displayMovies}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-[15px] gap-[15px]"
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => onMovieSelect(item)} className="w-[130px] h-[190px] rounded-lg overflow-hidden relative bg-[#1f1f2e]">
            <Image source={{ uri: item.poster_url }} className="w-full h-full object-cover" />
            {isTop10 && (
              <Text 
                className="absolute -bottom-4 -left-2.5 text-[80px] font-black text-white/80"
                style={{ textShadowColor: 'rgba(139,92,246,0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
              >
                {index + 1}
              </Text>
            )}
            {!isTop10 && (
              <View className="absolute bottom-0 w-full bg-black/70 p-1.5">
                 <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>{item.title}</Text>
              </View>
            )}
            {onRemove && (
              <TouchableOpacity 
                className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1 z-10 border border-white/20"
                onPress={() => onRemove(item)}
                activeOpacity={0.8}
              >
                <X color="#fff" size={16} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
