import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, Platform } from 'react-native';
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
      router.replace('/home');
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
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color="#8B5CF6"/>
              <Text style={{color: '#fff', marginTop:10}}>Verificando Gremio...</Text>
          </View>
      )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <ShieldAlert color="#8B5CF6" size={28} />
        <Text style={styles.headerTitle}>Gestión Maestra</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Formulario Creación */}
        <View style={styles.panel}>
           <Text style={styles.panelTitle}><UserPlus color="#fff" size={18} /> Nuevo Miembro</Text>
           <TextInput style={styles.input} placeholderTextColor="#666" placeholder="Correo" value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" />
           <TextInput style={styles.input} placeholderTextColor="#666" placeholder="Alias (Username)" value={newUsername} onChangeText={setNewUsername} />
           <TextInput style={styles.input} placeholderTextColor="#666" placeholder="Contraseña provisoria" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
           
           <TouchableOpacity onPress={handleCreateUser} disabled={isCreating} style={styles.button}>
              {isCreating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>CREAR CUENTA</Text>}
           </TouchableOpacity>
        </View>

        {/* Lista */}
        <View style={styles.panel}>
            <Text style={styles.panelTitle}>Directorio Central</Text>
            {loading ? <ActivityIndicator color="#8B5CF6" /> : (
                users.map(u => {
                    const isMaster = u.email === ADMIN_EMAIL;
                    const username = u.user_metadata?.username || u.email.split('@')[0];
                    return (
                        <View key={u.id} style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{username}</Text>
                                <Text style={styles.userEmail}>{u.email}</Text>
                                {isMaster && <Text style={styles.masterBadge}>MÁSTER</Text>}
                            </View>
                            <TouchableOpacity 
                              disabled={isMaster} 
                              style={[styles.delBtn, isMaster && {opacity:0.3}]}
                              onPress={() => handleDeleteUser(u.id, u.email)}
                            >
                                <Trash2 color="#ef4444" size={20} />
                            </TouchableOpacity>
                        </View>
                    );
                })
            )}
        </View>
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    // Removemos padding OS iOS fijo ya que SafeAreaView lo maneja
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scroll: {
    padding: 15,
  },
  panel: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  panelTitle: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#fff',
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 2,
  },
  masterBadge: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  delBtn: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  }
});
