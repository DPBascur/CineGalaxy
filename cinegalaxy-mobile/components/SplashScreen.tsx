import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Brillo Cósmico (Framer motion replication)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Text style={styles.logo}>CineGalaxy</Text>
        <Text style={styles.subtitle}>Cargando entorno espacial...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 50,
    fontWeight: '900',
    color: '#8B5CF6',
    textShadowColor: 'rgba(139,92,246,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  subtitle: {
    color: '#a1a1aa',
    marginTop: 20,
    letterSpacing: 3,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
});
