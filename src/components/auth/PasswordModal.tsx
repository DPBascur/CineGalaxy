"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X, KeySquare } from "lucide-react";

interface PasswordModalProps {
  onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Mínimo 6 caracteres requeridos.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message || "No se pudo actualizar la contraseña.");
      setIsLoading(false);
    } else {
      setSuccessMsg("¡Actualización exitosa! Serás redirigido al portal...");
      setTimeout(async () => {
        await supabase.auth.signOut();
        onClose();
        window.location.href = "/";
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-sm relative shadow-[0_0_50px_rgba(139,92,246,0.3)]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <KeySquare className="text-primary w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold neon-text">Cambio de Llave</h2>
          <p className="text-sm text-muted text-center mt-2">Introduce tu nueva constraseña cósmica</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-xs text-center">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-xs text-center font-bold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            placeholder="Nueva Contraseña" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-background/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-white"
          />
          <input 
            type="password" 
            placeholder="Confirmar Contraseña" 
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="bg-background/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-white"
          />

          <button 
            type="submit" 
            disabled={isLoading || !!successMsg}
            className="mt-2 w-full bg-primary hover:bg-primary/80 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.4)] flex justify-center items-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Actualizar Acceso"}
          </button>
        </form>
      </div>
    </div>
  );
}
