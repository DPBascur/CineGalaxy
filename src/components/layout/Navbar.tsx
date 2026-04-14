"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Menu, User as UserIcon, LogOut, Settings, Key, X, Rocket } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import PasswordModal from "@/components/auth/PasswordModal";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "Inicio";

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      router.push(`/?query=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setInputValue("");
    setSearchOpen(false);
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloquear scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Series", path: "/?tab=Series" },
    { name: "Películas", path: "/?tab=Películas" },
    { name: "Novedades", path: "/?tab=Populares" },
  ];

  return (
    <nav
      className={clsx(
        "fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 md:px-12 py-4 flex items-center justify-between border-b border-transparent",
        isScrolled 
          ? "bg-black/40 backdrop-blur-3xl backdrop-saturate-200 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] py-3" 
          : "bg-gradient-to-b from-background via-background/80 to-transparent"
      )}
    >
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-2 cursor-pointer group flex-shrink-0 z-10 w-[120px]">
        <img 
          src="/cinegalaxy_logo.png" 
          alt="CineGalaxy Logo" 
          className="w-8 h-8 rounded-md shadow-[0_0_10px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_20px_rgba(192,132,252,0.8)] transition-all duration-300" 
        />
        <motion.h1 
          className="text-primary font-extrabold text-3xl hidden lg:block"
          animate={{ 
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.05, 1],
            textShadow: ["0px 0px 8px #8B5CF6", "0px 0px 25px #C084FC", "0px 0px 8px #8B5CF6"] 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          CineGalaxy
        </motion.h1>
      </Link>

      {/* Centered Navigation Links */}
      <ul className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 space-x-1 bg-surface/50 backdrop-blur-xl px-2 py-1.5 rounded-full border border-white/10 shadow-lg">
        {navLinks.map((link) => {
          // Logic for exact active matching
          const isActive = (currentTab === "Inicio" && link.name === "Inicio") || 
                           (currentTab === "Populares" && link.name === "Novedades") ||
                           (currentTab === link.name);
          return (
            <li key={link.name} className="relative">
              <Link 
                href={link.path}
                className={clsx(
                  "relative px-5 py-1.5 rounded-full font-semibold text-sm transition-all duration-300 w-full flex items-center justify-center z-10",
                  isActive 
                    ? "text-white" 
                    : "text-muted hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.6)] rounded-full -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span>{link.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Right Controls */}
      <div className="flex items-center justify-end gap-3 sm:gap-5 z-10 w-[120px] sm:w-[220px]">
        <div className="relative flex items-center justify-end">
          <div
            className={clsx(
              "flex items-center overflow-hidden transition-all duration-300 ease-in-out glass-panel rounded-full relative mr-2 hidden sm:flex",
              searchOpen ? "w-48 sm:w-56 px-4 pr-10 opacity-100" : "w-0 opacity-0 pointer-events-none border-transparent"
            )}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Películas..."
              className="bg-transparent border-none text-sm text-foreground focus:outline-none w-full py-2 placeholder-muted"
            />
            {inputValue && (
              <button 
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors bg-surface rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            onClick={() => {
              if (searchOpen && inputValue.trim()) {
                router.push(`/?query=${encodeURIComponent(inputValue.trim())}`);
              } else if (!searchOpen) {
                setSearchOpen(true);
              } else {
                setSearchOpen(false);
              }
            }}
            className="text-foreground hover:text-primary transition-colors hover:shadow-[0_0_10px_rgba(139,92,246,0.5)] p-2 rounded-full mr-2"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => router.push('/?random=1')}
            className="text-foreground hover:text-accent transition-all duration-300 hover:scale-110 p-2 rounded-full border border-transparent hover:border-accent shadow-[0_0_15px_rgba(244,114,182,0)] hover:shadow-[0_0_15px_rgba(244,114,182,0.5)] bg-surface/50 sm:bg-transparent"
            title="Viaje Aleatorio"
          >
            <Rocket className="w-5 h-5" />
          </button>
        </div>
        
        {session ? (
          <div className="hidden md:flex items-center gap-4 relative group">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 cursor-pointer shadow-sm bg-surface/80 flex items-center justify-center backdrop-blur-xl group-hover:border-primary transition-all duration-300">
              <UserIcon className="w-full h-full p-2 text-white/90 group-hover:text-primary transition-colors" />
            </div>

            {/* Dropdown Menu Profile */}
            <div className="absolute right-0 top-full mt-3 w-56 bg-background/95 backdrop-blur-3xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 flex flex-col overflow-hidden py-2 z-50">
              
              <div className="px-4 py-3 border-b border-white/5 mb-2 bg-white/5">
                <p className="text-xs text-muted truncate">{session.user.email}</p>
                {session.user.user_metadata?.username && (
                  <p className="text-sm font-bold text-primary truncate">@{session.user.user_metadata.username}</p>
                )}
              </div>

              {(session.user.email === "danielpa423@gmail.com" || session.user.user_metadata?.role === "admin") && (
                <button 
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2.5 text-sm text-left hover:bg-white/10 flex items-center gap-3 text-white transition-colors"
                >
                  <Settings size={16} className="text-accent" />
                  Panel Admin
                </button>
              )}
              
              <button 
                onClick={() => setPasswordOpen(true)}
                className="px-4 py-2.5 text-sm text-left hover:bg-white/10 flex items-center gap-3 text-white transition-colors"
              >
                <Key size={16} className="text-primary" />
                Cambiar Contraseña
              </button>

              <div className="h-px bg-white/5 my-2 mx-4"></div>
              
              <button 
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2.5 text-sm text-left hover:bg-red-500/20 flex items-center gap-3 text-red-500 font-medium transition-colors"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setAuthOpen(true)}
            className="hidden md:block text-sm px-4 py-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/50 rounded-full transition-all duration-300 font-semibold shadow-[0_0_10px_rgba(139,92,246,0.2)]"
          >
            Iniciar Sesión
          </button>
        )}
        
        <button 
          className="md:hidden text-foreground ml-2" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={clsx(
          "fixed inset-0 top-[60px] z-40 md:hidden transition-all duration-300",
          mobileMenuOpen ? "visible" : "invisible pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div 
          className={clsx("absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity", mobileMenuOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMobileMenuOpen(false)} 
        />

        {/* Panel */}
        <div className={clsx(
          "absolute right-0 top-0 h-full w-72 bg-background/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl transition-transform duration-300 flex flex-col py-6 px-5 gap-2 overflow-y-auto",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Mobile Nav Links */}
          <p className="text-xs uppercase text-muted/60 font-bold tracking-widest mb-2 px-2">Navegar</p>
          {navLinks.map((link) => {
            const isActive = (currentTab === "Inicio" && link.name === "Inicio") || 
                             (currentTab === "Populares" && link.name === "Novedades") ||
                             (currentTab === link.name);
            return (
              <Link 
                key={link.name} 
                href={link.path} 
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "px-4 py-3 rounded-xl font-semibold text-sm transition-all",
                  isActive 
                    ? "bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]" 
                    : "text-muted hover:text-white hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="h-px bg-white/10 my-3" />

          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim()) {
                  router.push(`/?query=${encodeURIComponent(inputValue.trim())}`);
                  setMobileMenuOpen(false);
                }
              }}
              placeholder="Buscar películas..."
              className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/50 transition-all"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          </div>

          <div className="h-px bg-white/10 my-3" />

          {/* Mobile User Options */}
          {session && (
            <>
              <p className="text-xs uppercase text-muted/60 font-bold tracking-widest mb-2 px-2">Cuenta</p>
              <p className="text-xs text-muted px-2 mb-1 truncate">{session.user.email}</p>
              
              {(session.user.email === "danielpa423@gmail.com" || session.user.user_metadata?.role === "admin") && (
                <button 
                  onClick={() => { router.push('/admin'); setMobileMenuOpen(false); }}
                  className="px-4 py-3 text-sm text-left hover:bg-white/5 flex items-center gap-3 text-white rounded-xl transition-colors"
                >
                  <Settings size={16} className="text-accent" />
                  Panel Admin
                </button>
              )}

              <button 
                onClick={() => { setPasswordOpen(true); setMobileMenuOpen(false); }}
                className="px-4 py-3 text-sm text-left hover:bg-white/5 flex items-center gap-3 text-white rounded-xl transition-colors"
              >
                <Key size={16} className="text-primary" />
                Cambiar Contraseña
              </button>

              <button 
                onClick={() => { supabase.auth.signOut(); setMobileMenuOpen(false); }}
                className="px-4 py-3 text-sm text-left hover:bg-red-500/10 flex items-center gap-3 text-red-400 rounded-xl transition-colors mt-2"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {passwordOpen && <PasswordModal onClose={() => setPasswordOpen(false)} />}
    </nav>
  );
}
