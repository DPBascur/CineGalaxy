"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, ShieldAlert, Loader2, ArrowLeft, Edit2, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { SpaceParticles } from "@/components/layout/SpaceParticles";

const ADMIN_EMAIL = "danielpa423@gmail.com";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Creation Form
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // Edit Modal
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/");
        return;
      }
      
      const email = session.user.email;
      const role = session.user.user_metadata?.role;
      
      if (email === ADMIN_EMAIL || role === "admin") {
        setIsAdmin(true);
        setIsSuperAdmin(email === ADMIN_EMAIL);
        fetchUsers();
      } else {
        router.push("/");
      }
    }
    checkAdminStatus();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: newUserEmail, 
          password: newUserPassword,
          username: newUsername,
          role: newUserRole
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUsername("");
      setNewUserRole("user");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
    setIsCreating(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: editingUser.id, 
          username: editUsername, 
          role: editRole 
        })
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error actualizando al usuario");
    }
    setIsEditing(false);
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (email === ADMIN_EMAIL) {
      alert("Comando inválido. El creador absoluto no puede ser eliminado.");
      return;
    }
    
    if (confirm(`¿Estás seguro de que quieres eliminar a ${email}?`)) {
      try {
        const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchUsers();
        } else {
          const data = await res.json();
          alert(data.error);
        }
      } catch (err) {
        console.error("Error al borrar el usuario", err);
      }
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted">Verificando Credenciales Cósmicas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-20 overflow-hidden">
      {/* Background Espacial para el Gremio */}
      <SpaceParticles id="admin-stars" />
      <Navbar />

      <div className="relative z-10 pt-32 px-4 md:px-12 max-w-6xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/")}
            className="p-2 border border-primary/20 rounded-lg hover:border-primary text-muted transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white flex items-center gap-4">
              <ShieldAlert className="w-10 h-10 text-primary opacity-80" />
              Gestión Maestra
            </h1>
            <p className="text-muted/80 mt-2 text-sm tracking-wide uppercase font-semibold">Consola Suprema · Acceso Restringido</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Panel Lateral: Crear Usuario */}
          <div className="glass-panel backdrop-blur-2xl bg-white/[0.02] p-8 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-500 h-fit">
            <h2 className="text-2xl font-light mb-6 flex items-center gap-3 text-primary neon-text border-b border-primary/20 pb-4">
              <UserPlus className="w-6 h-6 text-accent opacity-80" />
              Nuevo Miembro
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {error && <p className="text-red-400 text-sm bg-red-400/10 p-2 rounded">{error}</p>}
              
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Correo Electrónico</label>
                <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-surface border border-primary/30 focus:border-primary rounded p-2 text-sm text-foreground" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Username (Alias)</label>
                <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full bg-surface border border-primary/30 focus:border-primary rounded p-2 text-sm text-foreground" required placeholder="Ej: s4ik0" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Contraseña Provisoria</label>
                <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full bg-surface border border-primary/40 focus:border-primary focus:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all rounded p-2 text-sm text-foreground outline-none" required minLength={6} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Tipo de Usuario</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full bg-surface border border-primary/40 focus:border-primary focus:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all rounded p-2 text-sm text-foreground outline-none">
                  <option value="user">Espectador Estándar</option>
                  <option value="admin">Administrador Colega</option>
                </select>
              </div>

              <button type="submit" disabled={isCreating} className="w-full mt-2 py-3 bg-primary hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] rounded-lg text-white font-bold flex justify-center text-sm uppercase tracking-wider">
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin"/> : "Crear Cuenta"}
              </button>
            </form>
          </div>

          {/* Panel Principal: Listado */}
          <div className="md:col-span-2 glass-panel backdrop-blur-2xl bg-white/[0.02] p-8 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-500">
            <h2 className="text-2xl font-light mb-8 text-primary neon-text border-b border-primary/20 pb-4">Directorio Central</h2>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-muted/20 text-muted">
                      <th className="pb-3 text-sm font-semibold">Username</th>
                      <th className="pb-3 text-sm font-semibold">Correo</th>
                      <th className="pb-3 text-sm font-semibold">Rol</th>
                      <th className="pb-3 text-sm font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isMaster = u.email === ADMIN_EMAIL;
                      const role = u.user_metadata?.role || 'user';
                      const username = u.user_metadata?.username || u.email.split('@')[0];

                      return (
                      <tr key={u.id} className="border-b border-muted/10 hover:bg-surface/30 transition-colors">
                        <td className="py-4 text-sm font-medium text-foreground">
                          {username}
                        </td>
                        <td className="py-4 text-xs text-muted">
                          {u.email}
                        </td>
                        <td className="py-4 text-xs">
                          {isMaster ? (
                            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase font-bold shadow-[0_0_8px_rgba(239,68,68,0.3)]">Máster Absoluto</span>
                          ) : role === 'admin' ? (
                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-bold">Admin</span>
                          ) : (
                            <span className="text-[10px] bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full uppercase font-bold">Espectador</span>
                          )}
                        </td>
                        <td className="py-4 text-right flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingUser(u);
                              setEditUsername(username);
                              setEditRole(role);
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1.5 bg-blue-400/10 hover:bg-blue-400/20 rounded transition-colors"
                            title="Editar Metadata"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={isMaster}
                            className={`p-1.5 rounded transition-colors ${
                              isMaster ? "text-gray-600 bg-gray-800 cursor-not-allowed" : "text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20"
                            }`}
                            title={isMaster ? "Inmortal" : "Revocar acceso"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Edition */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="relative w-full max-w-sm glass-panel p-6 rounded-xl border border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-muted hover:text-foreground">
              <X className="w-5 h-5"/>
            </button>
            <h3 className="text-xl font-bold mb-4 text-foreground">Editar a {editingUser.email}</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Username</label>
                <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full bg-surface border border-primary/30 focus:border-primary rounded p-2 text-sm text-foreground" required />
              </div>
              {!isSuperAdmin && editingUser.email === ADMIN_EMAIL ? null : (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Cambiar Jerarquía</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value)} disabled={editingUser.email === ADMIN_EMAIL} className="w-full bg-surface border border-primary/30 focus:border-primary rounded p-2 text-sm text-foreground">
                    <option value="user">Espectador Estándar</option>
                    <option value="admin">Administrador Colega</option>
                  </select>
                </div>
              )}
              <button disabled={isEditing} className="w-full py-2 bg-primary text-white rounded font-bold mt-2">
                {isEditing ? "Guardando..." : "Aplicar Cambios"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
