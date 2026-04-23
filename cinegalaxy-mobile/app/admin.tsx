import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { ArrowLeft, ShieldAlert, Trash2, Edit2, UserPlus } from 'lucide-react-native';

const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL || "";
const API_URL = __DEV__ 
  ? (process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000/api") 
  : (process.env.EXPO_PUBLIC_PROD_API_URL || "https://cine-galaxy.vercel.app/api");

export default function AdminScreen() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formularios
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/');
      return;
    }
    
    const email = session.user.email;
    const role = session.user.user_metadata?.role;
    
    if (email === ADMIN_EMAIL || role === "admin") {
      setIsAdmin(true);
      fetchUsers();
    } else {
      Alert.alert("Acceso Denegado", "No tienes permisos de Gremio.");
      router.replace('/(tabs)');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/admin/users`);
        const data = await res.json();
        if (data.users) setUsers(data.users);
    } catch (err) {
        Alert.alert("Error", "No se pudo contactar con el Comando Central de Next.js. Revisa tu conexión.");
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (email === ADMIN_EMAIL) {
      Alert.alert("Error", "El creador absoluto no puede ser eliminado.");
      return;
    }
    
    Alert.alert(
      "Confirmación",
      `¿Destruir la cuenta de ${email}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Mátalo", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/admin/users?id=${id}`, { method: "DELETE" });
              if (res.ok) fetchUsers();
              else Alert.alert("Fallo al borrar.");
            } catch (err) {
              console.error(err);
            }
          }
        }
      ]
    );
  };

  const handleCreateUser = async () => {
      if (!newEmail || !newPassword) return;
      setIsCreating(true);
      try {
          const res = await fetch(`${API_URL}/admin/users`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  email: newEmail,
                  password: newPassword,
                  username: newUsername,
                  role: "user"
              })
          });
          if (res.ok) {
              Alert.alert("Éxito", "Guardián registrado.");
              setNewEmail(''); setNewPassword(''); setNewUsername('');
              fetchUsers();
          } else {
              const data = await res.json();
              Alert.alert("Fallo", data.error || "Misterio.");
          }
      } catch(err) {
          Alert.alert("Error Fatal");
      }
      setIsCreating(false);
  };

  if (isAdmin === null) {
      return (
          <View className="flex-1 bg-zinc-950 justify-center items-center">
              <ActivityIndicator size="large" color="#8B5CF6"/>
              <Text className="text-white mt-2.5">Verificando Gremio...</Text>
          </View>
      )
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center p-4 bg-[#141414] border-b border-violet-500/30">
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="mr-4">
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <ShieldAlert color="#8B5CF6" size={28} />
        <Text className="text-white text-[22px] font-bold ml-2.5">Gestión Maestra</Text>
      </View>

      <ScrollView contentContainerClassName="p-4">
        
        {/* Formulario Creación */}
        <View className="bg-[#141414] rounded-xl p-5 mb-5 border border-white/5">
           <Text className="text-violet-500 text-lg font-bold mb-4 flex-row items-center"><UserPlus color="#fff" size={18} /> Nuevo Miembro</Text>
           <TextInput className="bg-white/[0.03] border border-white/10 rounded-lg text-white p-3 mb-3" placeholderTextColor="#666" placeholder="Correo" value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" />
           <TextInput className="bg-white/[0.03] border border-white/10 rounded-lg text-white p-3 mb-3" placeholderTextColor="#666" placeholder="Alias (Username)" value={newUsername} onChangeText={setNewUsername} />
           <TextInput className="bg-white/[0.03] border border-white/10 rounded-lg text-white p-3 mb-3" placeholderTextColor="#666" placeholder="Contraseña provisoria" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
           
           <TouchableOpacity onPress={handleCreateUser} disabled={isCreating} className="bg-violet-500 p-4 rounded-lg items-center mt-1.5">
              {isCreating ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold tracking-widest">CREAR CUENTA</Text>}
           </TouchableOpacity>
        </View>

        {/* Lista */}
        <View className="bg-[#141414] rounded-xl p-5 mb-5 border border-white/5">
            <Text className="text-violet-500 text-lg font-bold mb-4 flex-row items-center">Directorio Central</Text>
            {loading ? <ActivityIndicator color="#8B5CF6" /> : (
                users.map(u => {
                    const isMaster = u.email === ADMIN_EMAIL;
                    const username = u.user_metadata?.username || u.email.split('@')[0];
                    return (
                        <View key={u.id} className="flex-row justify-between items-center border-b border-white/5 py-4">
                            <View className="flex-1">
                                <Text className="text-white font-bold text-base">{username}</Text>
                                <Text className="text-zinc-400 text-xs mt-0.5">{u.email}</Text>
                                {isMaster && <Text className="text-red-500 bg-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold self-start mt-1.5">MÁSTER</Text>}
                            </View>
                            <TouchableOpacity 
                              disabled={isMaster} 
                              className={`p-2.5 bg-red-500/10 rounded-lg ${isMaster ? 'opacity-30' : ''}`}
                              onPress={() => handleDeleteUser(u.id, u.email)}
                            >
                                <Trash2 color="#ef4444" size={20} />
                            </TouchableOpacity>
                        </View>
                    );
                })
            )}
        </View>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
