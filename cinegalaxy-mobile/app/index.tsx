import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/(tabs)');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg('Credenciales inválidas. Acceso denegado.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-zinc-950 justify-center items-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-violet-500 mt-5 font-bold tracking-widest">Conectando a CineGalaxy...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-zinc-950"
    >
      <ScrollView 
        contentContainerClassName="flex-grow justify-center"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center p-8">
          <Text 
            className="text-4xl text-white font-bold text-center mb-1"
            style={{ textShadowColor: 'rgba(139,92,246,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
          >
            CineGalaxy
          </Text>
          <Text className="text-zinc-400 text-center font-medium mb-10">Portal Privado · Ingrese sus credenciales</Text>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-5">
              <Text className="text-red-500 text-center font-semibold">{errorMsg}</Text>
            </View>
          ) : null}

          <View className="mb-6">
            <Text className="text-zinc-400 text-xs font-bold mb-2 tracking-widest">CORREO ELECTRÓNICO</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-base"
              placeholderTextColor="#666"
              placeholder="admin@cinegalaxy.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="mb-6">
            <Text className="text-zinc-400 text-xs font-bold mb-2 tracking-widest">CONTRASEÑA</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-base"
              placeholderTextColor="#666"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleLogin} className="bg-violet-500 p-4 rounded-xl items-center mt-2 shadow-lg shadow-violet-500/40">
            <Text className="text-white font-bold text-base tracking-widest">INICIAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
