import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#a1a1aa" size={20} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Key color="#8B5CF6" size={28} />
            <Text style={styles.title}>Cambiar Contraseña</Text>
          </View>
          
          <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
          <TextInput 
            style={styles.input}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
          <TextInput 
            style={styles.input}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitBtn}>
             {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>Aceptar</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 10
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  label: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 20
  },
  submitBtn: {
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.5,
    shadowOffset: { width:0, height:0 },
    shadowRadius: 10
  },
  submitTxt: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1
  }
});
