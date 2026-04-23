import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { X, Key } from 'lucide-react-native';

interface PasswordModalProps {
  onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      Alert.alert("Error", "No se pudo actualizar la contraseña.");
    } else {
      Alert.alert("Éxito", "Tu contraseña ha sido actualizada galácticamente.");
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal visible animationType="fade" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/80 justify-center items-center p-5">
        <View className="w-full max-w-[400px] bg-[#141414] rounded-2xl p-6 border border-violet-500/20 relative">
          <TouchableOpacity onPress={onClose} className="absolute top-[15px] right-[15px] z-10 p-1">
            <X color="#a1a1aa" size={20} />
          </TouchableOpacity>

          <View className="flex-row items-center mb-6 gap-2.5">
            <Key color="#8B5CF6" size={28} />
            <Text className="text-white text-xl font-bold">Cambiar Contraseña</Text>
          </View>
          
          <Text className="text-zinc-400 text-[10px] font-bold mb-2 tracking-widest">NUEVA CONTRASEÑA</Text>
          <TextInput 
            className="bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-5"
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
          />

          <Text className="text-zinc-400 text-[10px] font-bold mb-2 tracking-widest">CONFIRMAR CONTRASEÑA</Text>
          <TextInput 
            className="bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-5"
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-violet-500 p-[15px] rounded-lg items-center mt-1 shadow-lg shadow-violet-500/50">
             {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold tracking-widest">Aceptar</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
