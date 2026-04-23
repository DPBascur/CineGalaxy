import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

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
    <View className="flex-1 bg-black justify-center items-center">
      <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Text 
          className="text-[50px] font-black text-violet-500"
          style={{ textShadowColor: 'rgba(139,92,246,0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 }}
        >
          CineGalaxy
        </Text>
        <Text className="text-zinc-400 mt-5 tracking-[3px] text-xs font-bold uppercase">Cargando entorno espacial...</Text>
      </Animated.View>
    </View>
  );
}
