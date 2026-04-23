import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Settings, Key, LogOut, ArrowLeft, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import PasswordModal from '../../components/PasswordModal';

export default function SettingsScreen() {
  const [userSession, setUserSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserSession(session);
        const email = session.user.email;
        const role = session.user.user_metadata?.role;
        const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || "";
        if ((email && email === adminEmail) || role === "admin") {
          setIsAdmin(true);
        }
      }
    }
    loadSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const username = userSession?.user?.user_metadata?.username || userSession?.user?.email?.split('@')[0] || "Invitado";
  const email = userSession?.user?.email || "";

  return (
    <View className="flex-1 bg-zinc-950">
      <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-4 bg-[#141414] border-b border-white/10 flex-row items-center gap-3">
         <TouchableOpacity onPress={() => router.push('/(tabs)')} className="p-1">
           <ArrowLeft color="#fff" size={24} />
         </TouchableOpacity>
         <Text className="text-white text-xl font-bold">Ajustes</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="p-5">
        <View className="items-center mb-8 mt-5">
           <View className="w-24 h-24 bg-violet-500/20 rounded-full border border-violet-500/50 items-center justify-center mb-4">
              <Text className="text-violet-500 text-4xl font-bold uppercase">{username.charAt(0)}</Text>
           </View>
           <Text className="text-white text-2xl font-bold">{username}</Text>
           <Text className="text-zinc-400 text-sm">{email}</Text>
        </View>

        <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Cuenta y Seguridad</Text>
        <View className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden mb-8">
           {isAdmin && (
              <TouchableOpacity onPress={() => router.push('/admin')} className="flex-row items-center p-4 border-b border-white/5 gap-3">
                 <Shield color="#8B5CF6" size={22} />
                 <Text className="text-white font-bold flex-1">Panel Maestro (Admin)</Text>
              </TouchableOpacity>
           )}
           <TouchableOpacity onPress={() => setPasswordModalOpen(true)} className="flex-row items-center p-4 border-b border-white/5 gap-3">
              <Key color="#8B5CF6" size={22} />
              <Text className="text-white font-bold flex-1">Cambiar Contraseña</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={handleLogout} className="flex-row items-center p-4 gap-3 bg-red-500/5">
              <LogOut color="#ef4444" size={22} />
              <Text className="text-red-500 font-bold flex-1">Cerrar Sesión</Text>
           </TouchableOpacity>
        </View>

        <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Acerca de</Text>
        <View className="bg-[#141414] p-4 rounded-xl border border-white/5">
           <Text className="text-white font-bold mb-1">CineGalaxy v1.0.0</Text>
           <Text className="text-zinc-500 text-[11px] leading-4">
              CineGalaxy es un proveedor de servicios de streaming gratuito. No almacenamos ningún archivo en nuestros servidores. Todo el contenido es provisto por terceros no afiliados. Por favor, reporta cualquier infracción de derechos de autor con las partes correspondientes.
           </Text>
        </View>
      </ScrollView>

      {passwordModalOpen && <PasswordModal onClose={() => setPasswordModalOpen(false)} />}
    </View>
  );
}
