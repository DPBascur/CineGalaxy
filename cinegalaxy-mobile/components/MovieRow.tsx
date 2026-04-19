import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';

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
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList 
        horizontal
        data={displayMovies}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => onMovieSelect(item)} style={styles.cardContainer}>
            <Image source={{ uri: item.poster_url }} style={styles.poster} />
            {isTop10 && (
              <Text style={styles.topNumber}>{index + 1}</Text>
            )}
            {!isTop10 && (
              <View style={styles.overlay}>
                 <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
              </View>
            )}
            {onRemove && (
              <TouchableOpacity 
                style={styles.removeBtn} 
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
    textShadowColor: 'rgba(139,92,246,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  listContainer: {
    paddingHorizontal: 15,
    gap: 15,
  },
  cardContainer: {
    width: 130,
    height: 190,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1f1f2e',
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  topNumber: {
    position: 'absolute',
    bottom: -15,
    left: -10,
    fontSize: 80,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(139,92,246,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  }
});
