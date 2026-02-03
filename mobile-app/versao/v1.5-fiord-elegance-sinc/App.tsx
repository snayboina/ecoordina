import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  Lock,
  LogOut,
  AlertCircle,
  RotateCcw,
  Zap,
  Users,
  Timer,
  ListTodo,
  Clock,
  LogIn as LogInIcon
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { fetchCollaborators, fetchLiberationByMat, fetchLiberationData, login, supabase, calculateLeadTime } from './services/api';
import type { Collaborator, LiberationData, RequesterSession } from './types';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const START_DATE = dayjs('2026-01-01');
const END_DATE = dayjs('2026-03-31');

const ModernMobileSimulator: React.FC<{
  children: React.ReactNode,
  header?: React.ReactNode,
  footer?: React.ReactNode,
  variant?: 'midnight' | 'silver' | 'gold'
}> = ({ children, header, footer, variant = 'midnight' }) => {
  const isMidnight = variant === 'midnight';
  const isSilver = variant === 'silver';
  const isGold = variant === 'gold';

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 md:p-10 font-sans overflow-hidden">
      {/* Device Frame */}
      <div className={`relative w-full h-[100dvh] lg:w-[400px] lg:h-[820px] lg:rounded-[4rem] lg:p-3.5 lg:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-700 lg:border-[10px] relative
        ${isMidnight ? 'bg-slate-900 border-slate-800 shadow-slate-900/20' : ''}
        ${isSilver ? 'bg-slate-300 border-slate-200 shadow-slate-400/20' : ''}
        ${isGold ? 'bg-[#c5a059] border-[#b48d4a] shadow-amber-900/10' : ''}
      `}>

        {/* Physical Buttons Simulation */}
        <div className={`hidden lg:block absolute -left-[14px] top-32 w-[4px] h-12 rounded-l-md border-y border-white/5 shadow-inner transition-colors duration-700 ${isSilver ? 'bg-slate-400' : isGold ? 'bg-[#b48d4a]' : 'bg-slate-800'}`} /> {/* Action Button / Mute */}
        <div className={`hidden lg:block absolute -left-[14px] top-48 w-[4px] h-16 rounded-l-md border-y border-white/5 shadow-inner transition-colors duration-700 ${isSilver ? 'bg-slate-400' : isGold ? 'bg-[#b48d4a]' : 'bg-slate-800'}`} /> {/* Vol Up */}
        <div className={`hidden lg:block absolute -left-[14px] top-68 w-[4px] h-16 rounded-l-md border-y border-white/5 shadow-inner transition-colors duration-700 ${isSilver ? 'bg-slate-400' : isGold ? 'bg-[#b48d4a]' : 'bg-slate-800'}`} /> {/* Vol Down */}
        <div className={`hidden lg:block absolute -right-[14px] top-44 w-[4px] h-24 rounded-r-md border-y border-white/5 shadow-inner transition-colors duration-700 ${isSilver ? 'bg-slate-400' : isGold ? 'bg-[#b48d4a]' : 'bg-slate-800'}`} /> {/* Power Button */}

        {/* Camera / Notch Variation */}
        {isMidnight && (
          <div className="hidden lg:flex absolute top-6 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-[100] items-center justify-center border border-white/5 shadow-xl transition-all duration-700">
            <div className="w-1.5 h-1.5 bg-slate-900/50 rounded-full ml-auto mr-4 border border-white/5" />
            <div className="w-2.5 h-2.5 bg-[#0a0a0a] rounded-full mr-2 flex items-center justify-center">
              <div className="w-1 h-1 bg-indigo-500/20 rounded-full blur-[1px]" />
            </div>
          </div>
        )}
        {(isSilver || isGold) && (
          <div className="hidden lg:flex absolute top-7 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-[100] items-center justify-center border border-white/10 shadow-inner transition-all duration-700">
            <div className="w-1 h-1 bg-indigo-500/40 rounded-full blur-[0.5px]" />
          </div>
        )}

        {/* Screen Content Wrapper */}
        <div className="flex-1 w-full bg-app-bg overflow-hidden lg:rounded-[3.2rem] relative flex flex-col shadow-inner lg:pt-20 transition-all duration-700 font-sans">
          {/* Fixed Header Area */}
          {header && (
            <header className="flex-none w-full bg-app-bg/80 backdrop-blur-md border-b border-app-border z-50">
              <div className="max-w-7xl mx-auto">
                {header}
              </div>
            </header>
          )}

          {/* Screen Content */}
          <main className="flex-1 w-full max-w-7xl mx-auto relative flex flex-col overflow-hidden">
            <div className="flex-1 w-full bg-app-bg overflow-y-auto overflow-x-hidden scrollbar-hide text-app-text">
              {children}
            </div>
          </main>

          {/* Fixed Footer Area */}
          {footer && (
            <footer className="flex-none w-full bg-app-bg border-t border-app-border z-50">
              <div className="max-w-7xl mx-auto">
                {footer}
              </div>
            </footer>
          )}

          {/* Home Indicator - Only on larger screens */}
          <div className="hidden lg:flex flex-none h-6 items-center justify-center pb-2 bg-app-bg">
            <div className={`w-32 h-1 rounded-full transition-colors duration-700 ${isSilver ? 'bg-slate-200' : isGold ? 'bg-amber-100' : 'bg-brand-primary/10'}`} />
          </div>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none -z-10 opacity-20 transition-colors duration-1000 ${isGold ? 'bg-amber-500' : isSilver ? 'bg-blue-400' : 'bg-brand-primary/20'}`} />
    </div>
  );
};

const InitialView: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onNext}
    className="absolute inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer overflow-hidden p-0"
    style={{ backgroundColor: BRAND_CONFIG.BG_COLOR }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center shadow-xl shadow-brand-primary/20 border-4 border-white">
        <Zap className="text-white fill-white" size={48} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-display font-black text-2xl uppercase tracking-[0.3em] text-app-text">
          {BRAND_CONFIG.APP_NAME.split(' ')[0]}
        </span>
        <span className="font-display font-bold text-xs uppercase tracking-[0.4em] text-brand-primary">
          {BRAND_CONFIG.APP_NAME.split(' ')[1] || ''}
        </span>
      </div>
    </motion.div>

    {/* Subtle floating particles with brand color */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-brand-primary/10 rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-brand-primary/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-3/4 left-1/2 w-1.5 h-1.5 bg-brand-primary/15 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-12 text-app-text/40 text-[10px] font-black uppercase tracking-[0.3em]"
    >
      Toque para iniciar
    </motion.div>
  </motion.div>
);

const WelcomeView: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="relative h-full flex flex-col overflow-hidden">
    <div className="flex-1 flex flex-col items-center text-center px-6 md:px-10 max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 mb-4 mt-6 sm:mt-12 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/50 shadow-sm"
      >
        <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/20">
          <Zap className="text-white" size={16} fill="currentColor" />
        </div>
        <span className="font-display font-black text-xs uppercase tracking-widest text-app-text">
          {BRAND_CONFIG.APP_NAME.split(' ')[0]}<span className="text-brand-primary"> {BRAND_CONFIG.APP_NAME.split(' ')[1] || ''}</span>
        </span>
      </motion.div>

      <div className="w-full flex flex-col items-center mb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1
            className="font-black text-app-text tracking-tight font-display leading-[1.05]"
            style={{ fontSize: 'var(--text-hero)' }}
          >
            Sua jornada <br />
            operacional <br />
            começa <span className="text-brand-primary">aqui.</span>
          </h1>
          <p className="text-app-text-muted text-base md:text-lg leading-relaxed max-w-xs mx-auto font-medium">
            Bora saber se está liberado para as suas atividades!
          </p>
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="relative w-full max-w-[280px] aspect-square mb-8 flex items-center justify-center cursor-pointer outline-none bg-transparent border-none p-0 group"
      >
        <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-[60px] group-hover:bg-brand-primary/15 transition-colors" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.4
          }}
          className="relative z-10 w-full h-full animate-float"
        >
          <img
            src={BRAND_CONFIG.LOGOS.MAIN}
            className="w-full h-full object-cover rounded-[var(--radius-card)] border-4 border-white shadow-floating"
            alt="Welcome"
          />
        </motion.div>
      </motion.button>
    </div>

    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="p-6 md:p-10 w-full max-w-2xl mx-auto pb-12"
    >
      <button
        onClick={onNext}
        className="btn-primary w-full h-16 md:h-20 text-lg md:text-xl shadow-premium"
      >
        Acessar Plataforma
      </button>
      <div className="mt-8 flex justify-center items-center gap-4 opacity-20">
        <div className="h-px w-12 bg-app-text" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] font-display">Logística Integrada</span>
        <div className="h-px w-12 bg-app-text" />
      </div>
    </motion.div>
  </div>
);

const LoginView: React.FC<{ onLogin: (session: RequesterSession) => void, onBack?: () => void }> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const session = await login(email, password);
    if (session) {
      onLogin(session);
    } else {
      setError('E-mail ou senha incorretos.');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-8 bg-app-bg relative overflow-hidden min-h-[80dvh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 relative z-10 py-8"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white shadow-sm">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Zap className="text-white" size={16} fill="currentColor" />
            </div>
            <span className="font-display font-black text-xs uppercase tracking-widest text-app-text">
              {BRAND_CONFIG.APP_NAME.split(' ')[0]}<span className="text-brand-primary"> {BRAND_CONFIG.APP_NAME.split(' ')[1] || ''}</span>
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-app-text tracking-tight font-display">Acesse sua conta</h2>
            <p className="text-app-text-muted text-sm font-medium">Insira suas credenciais corporativas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.2em] text-app-text-muted font-black ml-1">E-mail Corporativo</label>
            <div className="relative group">
              <input
                type="email"
                required
                className="w-full bg-white border border-app-border rounded-2xl py-4 px-6 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-base text-app-text font-medium shadow-card"
                placeholder="ex: francis.rosa@elecnor.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.2em] text-app-text-muted font-black ml-1">Senha de Acesso</label>
            <div className="relative group">
              <input
                type="password"
                required
                className="w-full bg-white border border-app-border rounded-2xl py-4 px-6 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-base text-app-text font-medium shadow-card"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-app-text-muted opacity-40 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all">
                <Lock size={18} />
              </div>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-bold text-center">
              {error}
            </motion.div>
          )}

          <div className="pt-4 flex flex-col gap-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-16 md:h-18 text-lg"
            >
              {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Iniciar Sessão"}
            </button>
            <button type="button" onClick={onBack} className="text-[10px] uppercase tracking-widest text-app-text-muted font-black self-center hover:text-brand-primary transition-colors py-2">
              Voltar ao Início
            </button>
          </div>
        </form>
      </motion.div>

      {/* Decorative Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-accent/5 blur-[120px] rounded-full" />
    </div>
  );
};

const DashboardCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, delay?: number }> = ({ title, value, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    className="card-floating flex flex-col gap-4 border-none bg-white"
  >
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
        {icon}
      </div>
      <span className="text-app-text-muted text-[10px] font-black uppercase tracking-widest font-display">{title}</span>
    </div>
    <h3 className="text-3xl font-black text-app-text tracking-tight leading-none font-display">{value}</h3>
  </motion.div>
);

import { BRAND_CONFIG } from './arquitetura/brand.config';

const App: React.FC = () => {
  const [view, setView] = useState<'initial' | 'welcome' | 'login' | 'content'>('initial');
  const [activeTab, setActiveTab] = useState<'lib' | 'lead' | 'list' | 'dash'>('lib');
  const [frameStyle, setFrameStyle] = useState<'midnight' | 'silver' | 'gold'>('midnight');
  const [data, setData] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Injeção Dinâmica de Cores (Customização Ultra-Rápida)
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', BRAND_CONFIG.PRIMARY_COLOR);
    document.documentElement.style.setProperty('--bg-color', BRAND_CONFIG.BG_COLOR);
    document.documentElement.style.setProperty('--radius-main', BRAND_CONFIG.RADIUS.MAIN);
    document.documentElement.style.setProperty('--radius-card', BRAND_CONFIG.RADIUS.CARD);
    document.documentElement.style.setProperty('--text-hero', BRAND_CONFIG.FONT_SIZE.HERO);
    document.documentElement.style.setProperty('--text-title', BRAND_CONFIG.FONT_SIZE.TITLE);
    document.documentElement.style.setProperty('--text-body', BRAND_CONFIG.FONT_SIZE.BODY);
  }, []);

  /* Restaurando sessão */
  const [session, setSession] = useState<RequesterSession | null>(() => {
    const saved = localStorage.getItem('mob_session');
    return saved ? JSON.parse(saved) : null;
  });

  const loadData = async () => {
    if (!session) return;
    setTimeout(() => setLoading(true), 0);
    const result = await fetchCollaborators();

    const filtered = result.filter(c => {
      const matchRequester = String(c.requester || '').trim().toUpperCase() === session.name.trim().toUpperCase();
      return matchRequester;
    });

    if (!session.area && filtered.length > 0) {
      const userArea = filtered[0].area;
      if (userArea) {
        const updatedSession = { ...session, area: userArea };
        setTimeout(() => {
          setSession(updatedSession);
          localStorage.setItem('mob_session', JSON.stringify(updatedSession));
        }, 0);
      }
    }

    const finalData = filtered.filter(c => {
      if (!c.admissionDate) return false;
      const date = dayjs(c.admissionDate, ['DD/MM/YYYY', 'YYYY-MM-DD', 'DD/MM/YY'], true);
      return date.isValid() &&
        (date.isAfter(START_DATE) || date.isSame(START_DATE, 'day')) &&
        (date.isBefore(END_DATE) || date.isSame(END_DATE, 'day'));
    });

    setData(finalData);
    setLoading(false);
  };

  const handleLogin = (newSession: RequesterSession) => {
    setSession(newSession);
    localStorage.setItem('mob_session', JSON.stringify(newSession));
    setView('content');
    setActiveTab('lib');
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('mob_session');
    setData([]);
    setView('welcome');
  };

  useEffect(() => {
    if (session) {
      setView('content');
      setActiveTab('lib');
      loadData();
    }
  }, [session]);

  // Logout automático por inatividade (20 minutos)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      if (session) {
        timer = setTimeout(() => {
          handleLogout();
        }, 20 * 60 * 1000); // 20 minutos
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => document.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(evt => document.removeEventListener(evt, resetTimer));
    };
  }, [session]);

  const filteredData = data.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: data.length,
    active: data.filter(c => c.status !== 'ADMITIDO' && c.status !== 'CANCELADO').length,
    avgLeadTime: Math.round(data.filter(c => c.status === 'ADMITIDO').reduce((acc, curr) => acc + calculateLeadTime(curr), 0) / (data.filter(c => c.status === 'ADMITIDO').length || 1))
  };

  const headerBar = (
    <div className="flex flex-col bg-white/80 backdrop-blur-xl border-b border-app-border">
      <div className="px-6 py-4 flex justify-between items-center relative z-10 max-w-7xl mx-auto w-full">
        <button
          onClick={() => setView('welcome')}
          className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-app-text-muted hover:text-brand-primary active:scale-90 transition-all border border-app-border"
        >
          <ChevronRight size={20} className="rotate-180" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] font-display mb-1 text-center">
            {session?.name?.split(' ')[0]}
          </span>
          <div className="h-1 w-8 bg-brand-primary/20 rounded-full" />
        </div>

        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 active:scale-90 transition-all border border-red-100"
        >
          <LogOut size={18} />
        </button>
      </div>

      <AnimatePresence>
        {activeTab === 'list' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted opacity-40" size={18} />
              <input
                type="text"
                placeholder="Buscar em Pipeline..."
                className="nav-input w-full pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );



  const frameSelector = (
    <div className="hidden lg:flex fixed right-10 top-1/2 -translate-y-1/2 flex-col gap-6 bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 z-[200]">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Moldura</span>
        <div className="h-px w-full bg-slate-100" />
      </div>

      <div className="flex flex-col gap-4">
        {[
          { id: 'midnight', color: 'bg-slate-900', label: 'Midnight' },
          { id: 'silver', color: 'bg-slate-300', label: 'Silver' },
          { id: 'gold', color: 'bg-[#c5a059]', label: 'Gold' }
        ].map(style => (
          <button
            key={style.id}
            onClick={() => setFrameStyle(style.id as 'midnight' | 'silver' | 'gold')}
            className={`flex flex-col items-center gap-2 group transition-all ${frameStyle === style.id ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`w-12 h-12 ${style.color} rounded-2xl shadow-lg border-2 ${frameStyle === style.id ? 'border-brand-primary active' : 'border-white'} transition-all`} />
            <span className={`text-[9px] font-bold uppercase tracking-widest ${frameStyle === style.id ? 'text-brand-primary' : 'text-slate-400'}`}>{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (view === 'initial') {
    return (
      <>
        <ModernMobileSimulator variant={frameStyle}>
          <InitialView onNext={() => setView('welcome')} />
        </ModernMobileSimulator>
        {frameSelector}
      </>
    );
  }

  if (view === 'welcome') {
    return (
      <>
        <ModernMobileSimulator variant={frameStyle}>
          <WelcomeView onNext={() => {
            if (session) {
              setView('content');
              setActiveTab('lib');
            } else {
              setView('login');
            }
          }} />
        </ModernMobileSimulator>
        {frameSelector}
      </>
    );
  }

  if (view === 'login' || !session) {
    return (
      <>
        <ModernMobileSimulator variant={frameStyle}>
          <LoginView onLogin={handleLogin} onBack={() => setView('welcome')} />
        </ModernMobileSimulator>
        {frameSelector}
      </>
    );
  }


  return (
    <>
      <ModernMobileSimulator header={headerBar} variant={frameStyle}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-app-secondary animate-pulse text-sm">Atualizando seus dados...</p>
          </div>
        ) : (
          <div className="px-5">
            <AnimatePresence mode="wait">
              {activeTab === 'dash' && (
                <motion.div key="dash" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6 pt-4 pb-24">
                  <div className="grid grid-cols-2 gap-4">
                    <DashboardCard title="Em Mobilização" value={stats.active} icon={<Users size={20} />} delay={0.1} />
                    <DashboardCard title="Lead Time Médio" value={`${stats.avgLeadTime}d`} icon={<Timer size={20} />} delay={0.2} />
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const allStatuses = [
                        'EM SELEÇÃO', 'AGUARDANDO DOCUMENTOS', 'AGUARDANDO ASO', 'AGUARDANDO VIAGEM',
                        'SUBSTITUIR', 'TRANSFERIDO', 'LANÇAR NO RM', 'STAND BY',
                        'AGUARDANDO ACEITE DA CARTA', 'ADMITIDO'
                      ];

                      const statusCounts = allStatuses.map(status => ({
                        name: status,
                        count: data.filter(c => c.status === status).length
                      }));

                      const admitidos = statusCounts.find(s => s.name === 'ADMITIDO') || { name: 'ADMITIDO', count: 0 };
                      const otherStatuses = statusCounts.filter(s => s.name !== 'ADMITIDO');

                      const sortedStatuses = otherStatuses.sort((a, b) => b.count - a.count);
                      const mainStatuses = sortedStatuses.slice(0, 4);

                      return (
                        <div className="space-y-4">
                          {/* Hero Card: ADMITIDO */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-primary to-slate-700 p-6 text-white shadow-premium"
                          >
                            <div className="relative z-10 flex justify-between items-center">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 font-display">Meta Concluída</span>
                                <h3 className="text-2xl font-black tracking-tight font-display">{admitidos.name}</h3>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-5xl font-black font-display drop-shadow-lg">{admitidos.count}</span>
                                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Pessoas</span>
                              </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/20 blur-2xl rounded-full" />
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-white/30" />
                          </motion.div>

                          {/* Grid status cards */}
                          <div className="grid grid-cols-1 gap-3">
                            {mainStatuses.map((s, idx) => (
                              <motion.div
                                key={s.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                className="card-floating flex items-center justify-between p-4 border-none"
                              >
                                <div className="flex flex-col gap-0.5 max-w-[70%]">
                                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-display">{s.name}</span>
                                  <div className="h-1.5 bg-brand-primary/10 rounded-full w-full mt-1.5 overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(s.count / (stats.total || 1)) * 100}%` }}
                                      className="h-full bg-brand-primary rounded-full"
                                    />
                                  </div>
                                </div>
                                <span className="text-2xl font-black text-app-text font-display">{s.count}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}

              {activeTab === 'list' && (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 pt-4 pb-20">
                  {(() => {
                    const groups = filteredData.reduce((acc, current) => {
                      const role = current.role || 'Sem Função';
                      if (!acc[role]) acc[role] = [];
                      acc[role].push(current);
                      return acc;
                    }, {} as Record<string, Collaborator[]>);

                    const sortedRoles = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

                    if (sortedRoles.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-20 text-app-text-muted gap-3 opacity-40">
                          <ListTodo size={40} strokeWidth={1} />
                          <p className="text-sm font-medium">Nenhum registro encontrado.</p>
                        </div>
                      );
                    }

                    return sortedRoles.map((role) => (
                      <RoleGroupCard key={role} role={role} collaborators={groups[role]} />
                    ));
                  })()}
                </motion.div>
              )}

              {activeTab === 'lib' && (
                <LiberationView key="lib" />
              )}

              {activeTab === 'lead' && (
                <motion.div key="lead" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pt-4 pb-20">
                  <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-6 rounded-3xl text-white shadow-premium relative overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <Timer size={24} />
                        <h3 className="text-xl font-black font-display">Pipeline Mobilização</h3>
                      </div>
                      <p className="text-sm opacity-80">Acompanhe cada etapa da mobilização em tempo real.</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 blur-xl rounded-full" />
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-app-text-muted uppercase ml-2 tracking-widest font-display">Filtrar por Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-white border border-app-border rounded-xl px-4 py-3 text-xs font-bold text-app-text outline-none focus:border-brand-primary transition-all appearance-none"
                    >
                      <option value="TODOS">📊 TODOS OS STATUS</option>
                      <option value="ADMITIDO">✅ ADMITIDO</option>
                      <option value="EM SELEÇÃO">🔍 EM SELEÇÃO</option>
                      <option value="AGUARDANDO VIAGEM">✈️ AGUARDANDO VIAGEM</option>
                      <option value="AGUARDANDO DOCUMENTOS">📄 AGUARDANDO DOCUMENTOS</option>
                      <option value="SUBSTITUIR">🔄 SUBSTITUIR</option>
                      <option value="LANÇAR NO RM">📝 LANÇAR NO RM</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    {filteredData
                      .filter(c => c.status !== 'CANCELADO')
                      .filter(c => statusFilter === 'TODOS' || c.status === statusFilter)
                      .sort((a, b) => {
                        if (a.status === 'ADMITIDO' && b.status !== 'ADMITIDO') return -1;
                        if (a.status !== 'ADMITIDO' && b.status === 'ADMITIDO') return 1;
                        const countDates = (col: Collaborator) => [col.requestDate, col.examDate, col.asoReleased, col.admissionDate].filter(Boolean).length;
                        return countDates(b) - countDates(a);
                      })
                      .map((collab, i) => (
                        <TimelineCard key={collab.name + 'tl' + i} collab={collab} />
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </ModernMobileSimulator>
      {frameSelector}
    </>
  );
};

const TimelineCard: React.FC<{ collab: Collaborator }> = ({ collab }) => {
  const [expanded, setExpanded] = useState(false);
  const [selection, setSelection] = useState<{ start: number | null, end: number | null }>({ start: null, end: null });

  const isValidDate = (d: any) => {
    if (!d) return false;
    const str = String(d).trim();
    return str.length > 2 && !/^\d+$/.test(str);
  };

  const parseDate = (d?: string) => {
    if (!d) return null;
    const formats = ['DD/MM/YYYY', 'YYYY-MM-DD', 'DD/MM/YY'];
    for (const f of formats) {
      const m = dayjs(d, f);
      if (m.isValid()) return m;
    }
    return null;
  };

  const stages = [
    { label: 'Aprovação', date: collab.approvalDate, icon: <Zap size={14} /> },
    { label: 'Previsão Chegada', date: collab.expectedArrival, icon: <Clock size={14} /> },
    { label: 'Exame Médico', date: collab.examScheduled, icon: <Users size={14} /> },
    { label: 'ASO Liberado', date: collab.asoReleased, icon: <ListTodo size={14} /> },
    { label: 'Admissão', date: collab.status === 'ADMITIDO' ? collab.admissionDate : null, icon: <LogInIcon size={14} />, conditional: collab.status !== 'ADMITIDO' },
  ];

  const totalDays = calculateLeadTime(collab);

  const handleStageClick = (idx: number) => {
    const stage = stages[idx];
    if (!isValidDate(stage.date)) return;

    if (selection.start === null || (selection.start !== null && selection.end !== null)) {
      setSelection({ start: idx, end: null });
    } else {
      setSelection({ ...selection, end: idx });
    }
  };

  const calculateDiff = () => {
    if (selection.start === null || selection.end === null) return 0;
    const date1 = parseDate(String(stages[selection.start].date));
    const date2 = parseDate(String(stages[selection.end].date));
    if (!date1 || !date2) return 0;

    // Business days logic
    let start = date1.isBefore(date2) ? date1 : date2;
    let end = date1.isBefore(date2) ? date2 : date1;
    let count = 0;
    let cur = start.clone();
    while (cur.isBefore(end, 'day')) {
      const day = cur.day();
      if (day !== 0 && day !== 6) count++;
      cur = cur.add(1, 'day');
    }
    return count;
  };

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="card-floating overflow-hidden p-0 border-none mb-4"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between text-left relative"
      >
        <div className="flex flex-col gap-1 max-w-[65%]">
          <h4 className={`font-display font-bold text-base ${collab.name === 'Aguardando Colaborador' ? 'text-success' : 'text-app-text'}`}>
            {collab.name}
          </h4>
          <p className="text-[10px] text-app-text-muted uppercase tracking-widest font-bold">{collab.role}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 min-w-[80px]">
          <div className="flex flex-col items-end leading-none">
            <span className="text-xl font-black text-brand-primary leading-none font-display">
              {selection.start !== null && selection.end !== null ? calculateDiff() : totalDays}
            </span>
            <span className="text-[8px] font-bold text-brand-primary uppercase tracking-widest leading-none mt-1">
              {selection.start !== null && selection.end !== null ? 'CALCULADO' : 'DIAS'}
            </span>
          </div>
          <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${collab.status === 'ADMITIDO' ? 'bg-success/10 text-success' : 'bg-brand-primary/10 text-brand-primary'}`}>
            {collab.status}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 pt-2"
          >
            {/* Calculadora Banner */}
            {selection.start !== null && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] text-brand-primary font-bold uppercase tracking-wider">Calculadora de Intervalo</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-app-text font-medium">{stages[selection.start].label}</span>
                    {selection.end !== null ? (
                      <>
                        <ChevronRight size={12} className="text-app-secondary/40" />
                        <span className="text-[11px] text-app-text font-medium">{stages[selection.end].label}</span>
                        <span className="ml-2 text-xs font-black text-brand-primary">= {calculateDiff()} dias</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-app-secondary italic ml-2">...selecione a 2ª etapa</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelection({ start: null, end: null })} className="p-2 text-app-secondary/40 hover:text-brand-primary">
                  <RotateCcw size={14} />
                </button>
              </motion.div>
            )}

            <div className="relative border-l-2 border-app-border ml-2 space-y-6 py-2">
              {stages.map((stage, idx) => {
                const isConditional = 'conditional' in stage && stage.conditional;
                if (isConditional) return null;

                const dateVal = stage.date;
                const hasDate = isValidDate(dateVal);
                const isSelected = selection.start === idx || selection.end === idx;
                const isInRange = selection.start !== null && selection.end !== null &&
                  ((idx > selection.start && idx < selection.end) || (idx > selection.end && idx < selection.start));

                return (
                  <div
                    key={idx}
                    className={`relative pl-8 transition-opacity ${hasDate ? 'cursor-pointer hover:opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}
                    onClick={() => hasDate && handleStageClick(idx)}
                  >
                    {/* Dot */}
                    <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-app-bg flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 scale-125 z-20' : hasDate ? 'bg-brand-primary shadow-[0_0_10px_rgba(255,102,0,0.4)]' : 'bg-app-card'}`}>
                      {isSelected ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> : hasDate && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>

                    {/* Range Line Highlight */}
                    {isInRange && (
                      <div className="absolute -left-[1px] -top-3 bottom-0 w-[2px] bg-emerald-500/30" />
                    )}

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold tracking-tight ${isSelected ? 'text-emerald-400' : (hasDate ? 'text-app-text' : 'text-app-secondary/40')}`}>
                          {stage.label}
                        </span>
                        {hasDate && !isSelected && <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-md border border-green-500/10">OK</span>}
                        {isSelected && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20">SELECIONADO</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-app-secondary">
                        {stage.icon}
                        <span className="text-[10px] font-mono">{hasDate ? String(dateVal) : 'Aguardando'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RoleGroupCard: React.FC<{ role: string, collaborators: Collaborator[] }> = ({ role, collaborators }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout className="card-floating overflow-hidden p-0 border-none mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between text-left active:bg-app-bg transition-colors"
      >
        <div className="flex flex-col gap-1">
          <h4 className="font-display font-bold text-base text-app-text">{role}</h4>
          <span className="text-[10px] font-bold text-success uppercase tracking-widest">{collaborators.length} Profissionais</span>
        </div>
        <div className="flex items-center gap-4">
          {collaborators.some(c => c.status !== 'ADMITIDO') && (
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-lg shadow-blue-500/40 animate-pulse" />
          )}
          <motion.div animate={{ rotate: expanded ? 90 : 0 }}>
            <ChevronRight size={18} className="text-app-text-muted opacity-40" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-app-border bg-app-bg/30"
          >
            <div className="p-3 space-y-2">
              {collaborators.map((collab, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white border border-app-border shadow-sm">
                  <span className={`text-sm font-semibold ${collab.name === 'Aguardando Colaborador' ? 'text-success/80' : 'text-app-text/80'}`}>
                    {collab.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${collab.status === 'ADMITIDO' ? 'bg-success/10 text-success' : 'bg-brand-primary/10 text-brand-primary'}`}>
                    {collab.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StatusItem: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
  <div className="bg-white border border-app-border p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-card hover:shadow-floating transition-all">
    <span className="text-[9px] font-black text-app-text-muted uppercase tracking-widest font-display text-center">{label}</span>
    <span className={`text-sm font-black ${(value || '').toUpperCase() === 'OK' ? 'text-success' : (value || '').toUpperCase() === 'PENDENTE' ? 'text-danger' : 'text-app-text-muted opacity-50'}`}>
      {value || '-'}
    </span>
  </div>
);

const SkeletonItem: React.FC = () => (
  <div className="w-full bg-white border border-app-border p-6 rounded-[32px] flex justify-between items-center animate-pulse">
    <div className="flex flex-col gap-2 w-2/3">
      <div className="h-5 bg-slate-100 rounded-full w-full" />
      <div className="h-3 bg-slate-50 rounded-full w-1/2" />
    </div>
    <div className="w-12 h-12 bg-slate-50 rounded-full" />
  </div>
);

const LiberationView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LiberationData | null>(null);
  const [error, setError] = useState('');
  const [allData, setAllData] = useState<LiberationData[]>([]);
  const [suggestions, setSuggestions] = useState<LiberationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');



  useEffect(() => {
    loadAllData();

    // Sincronização em Tempo Real (Opção C)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta Insert, Update e Delete
          schema: 'public',
          table: 'liberation_data'
        },
        (payload: any) => {
          console.log('Mudança detectada no Realtime:', payload);
          // Recarrega os dados para garantir consistência ou faz o merge local
          loadAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAllData = async () => {
    // Sò mostra o loader se não tiver dados ainda (pra não piscar com realtime)
    if (allData.length === 0) setLoading(true);
    try {
      const data = await fetchLiberationData();
      console.log('Dados de liberação atualizados:', data);
      setAllData(data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearch('');
    setResult(null);
    setError('');
    setSuggestions([]);
    setShowSuggestions(false);
    setRoleFilter('ALL');
    setMonthFilter('ALL');
    setStatusFilter('ALL');
  };

  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const handleInputChange = (val: string) => {
    setSearch(val);
    const normalizedVal = normalize(val);
    if (normalizedVal.length > 1) {
      const filtered = allData.filter(d =>
        normalize(d.mat).includes(normalizedVal) ||
        normalize(d.nome).includes(normalizedVal)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item: LiberationData) => {
    setResult(item);
    setSearch(item.nome);
    setShowSuggestions(false);
    setError('');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setError('');
    setShowSuggestions(false);

    const normalizedSearch = normalize(search);

    const found = allData.find(d =>
      normalize(d.mat) === normalizedSearch ||
      normalize(d.nome) === normalizedSearch ||
      normalize(d.nome).includes(normalizedSearch)
    );

    if (found) {
      setResult(found);
    } else {
      const data = await fetchLiberationByMat(search);
      if (data) {
        setResult(data);
      } else {
        setError('Colaborador não encontrado.');
        setResult(null);
      }
    }
    setLoading(false);
  };

  const isReleased = (date?: string) => {
    return date && date.length > 5;
  };

  const filteredList = allData.filter(item => {
    // 1. Filtro de Status
    const itemIsReleased = isReleased(item.data_liberacao_ecoordin);
    if (statusFilter === 'LIBERADO' && !itemIsReleased) return false;
    if (statusFilter === 'NAO_LIBERADO' && itemIsReleased) return false;

    // 2. Filtro de Função (MANDATÓRIO)
    const matchesRole = roleFilter === 'ALL' || item.funcao === roleFilter;
    if (!matchesRole) return false;

    // 3. Filtro de Mês (Apenas para liberados ou se o filtro for ALL)
    if (monthFilter !== 'ALL') {
      if (!itemIsReleased) return false; // Se não está liberado, não tem mês para filtrar
      const date = dayjs(item.data_liberacao_ecoordin, 'DD/MM/YYYY');
      if (!date.isValid()) return false;
      const matchesMonth = (monthFilter === 'DEC' ? date.month() === 11 : monthFilter === 'JAN' ? date.month() === 0 : true);
      if (!matchesMonth) return false;
    }

    return true;
  });

  const uniqueRoles = Array.from(new Set(allData.map(d => d.funcao).filter(Boolean))).sort();

  const releasedCount = filteredList.filter(d => isReleased(d.data_liberacao_ecoordin)).length;
  const pendingCount = filteredList.length - releasedCount;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-4 pb-24 px-1">
      {/* Search & Filters Section */}
      {!result && (
        <div className="bg-white p-6 rounded-3xl border border-app-border shadow-premium space-y-6">
          <div className="flex justify-between items-center bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] font-display">Status de Liberação</span>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-app-text tabular-nums font-display">{releasedCount}</span>
                  <span className="text-[9px] font-bold text-success uppercase">Liberados</span>
                </div>
                <div className="w-px h-6 bg-brand-primary/20" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-danger tabular-nums font-display">{pendingCount}</span>
                  <span className="text-[9px] font-bold text-danger uppercase">Pendentes</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-brand-accent/20 rounded-xl flex items-center justify-center">
              <Zap className="text-brand-accent" size={20} fill="currentColor" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Filter: Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-app-text-muted uppercase ml-2 tracking-widest font-display">Função</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-app-border rounded-xl px-4 py-3 text-xs font-bold text-app-text outline-none focus:border-brand-primary transition-all appearance-none"
                >
                  <option value="ALL">TODAS AS FUNÇÕES</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role ? role.toUpperCase() : 'SEM FUNÇÃO'}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Filter: Período */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-app-text-muted uppercase ml-2 tracking-widest font-display">Período</label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-app-border rounded-xl px-4 py-3 text-xs font-bold text-app-text outline-none focus:border-brand-primary transition-all appearance-none"
                  >
                    <option value="ALL">TODOS</option>
                    <option value="DEC">DEZEMBRO</option>
                    <option value="JAN">JANEIRO</option>
                  </select>
                </div>

                {/* Filter: Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-app-text-muted uppercase ml-2 tracking-widest font-display">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-app-border rounded-xl px-4 py-3 text-xs font-bold text-app-text outline-none focus:border-brand-primary transition-all appearance-none"
                  >
                    <option value="ALL">TODOS</option>
                    <option value="LIBERADO">✓ LIBERADOS</option>
                    <option value="NAO_LIBERADO">🔒 PENDENTES</option>
                  </select>
                </div>
              </div>

              {(roleFilter !== 'ALL' || monthFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  onClick={handleClear}
                  className="w-full py-2.5 bg-white border border-dashed border-app-border rounded-xl text-[10px] font-bold text-app-text-muted uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 hover:text-brand-primary hover:border-brand-primary/50"
                >
                  <RotateCcw size={12} />
                  Limpar Filtros
                </button>
              )}
            </div>

            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted opacity-40" size={18} />
              <input
                type="text"
                className="w-full bg-white border border-app-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-semibold text-app-text shadow-card"
                placeholder="Insira matrícula ou nome..."
                value={search}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => search.length > 1 && setShowSuggestions(true)}
              />
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white border border-app-border rounded-2xl shadow-floating z-[100] overflow-hidden"
                  >
                    {suggestions.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-app-bg border-b border-app-border last:border-0 text-left transition-colors"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-app-text uppercase">{item.nome}</span>
                          <span className="text-[9px] text-app-text-muted font-bold">MATRÍCULA: {item.mat}</span>
                        </div>
                        <ChevronRight size={14} className="text-app-text-muted opacity-30" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      )}

      {(search || result) && !result && (
        <button
          onClick={handleClear}
          className="w-full py-4 bg-white border border-app-border rounded-full text-[10px] font-bold text-brand-orange uppercase tracking-widest active:scale-95 transition-all shadow-soft flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          Limpar Busca
        </button>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-6 bg-red-50 border border-red-100 rounded-[32px] flex items-center gap-4 text-red-500 text-sm font-bold shadow-soft">
            <AlertCircle size={20} />
            {error.toUpperCase()}
          </motion.div>
        )}

        {result && !loading ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-6">
            <div className={`p-8 rounded-[40px] border-2 ${isReleased(result.data_liberacao_ecoordin) ? 'bg-white border-success/20' : 'bg-white border-danger/20'} shadow-floating relative overflow-hidden`}>
              <div className="relative z-10 flex flex-col gap-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.2em] bg-app-bg px-3 py-1 rounded-full border border-app-border font-display">Matrícula {result.mat}</span>
                    <h2 className={`text-3xl font-black uppercase tracking-tight leading-tight font-display ${isReleased(result.data_liberacao_ecoordin) ? 'text-app-text' : 'text-danger'}`}>
                      {result.nome}
                    </h2>
                    <p className="text-app-text-muted text-sm font-bold uppercase tracking-widest opacity-60 font-display">{result.funcao}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isReleased(result.data_liberacao_ecoordin) ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {isReleased(result.data_liberacao_ecoordin) ? (
                      <Zap size={28} fill="currentColor" />
                    ) : (
                      <Lock size={28} />
                    )}
                  </div>
                </div>

                <div className="p-6 bg-app-bg rounded-3xl border border-app-border flex flex-col gap-1 shadow-inner">
                  <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest font-display">Status de Liberação</span>
                  <span className={`text-xl font-black font-display ${isReleased(result.data_liberacao_ecoordin) ? 'text-success' : 'text-danger'}`}>
                    {isReleased(result.data_liberacao_ecoordin) ? '✓ LIBERADO NO SISTEMA' : '× PENDENTE DE LIBERAÇÃO'}
                  </span>
                  <span className="text-[10px] font-bold text-app-text-muted mt-2 opacity-50">Processado em: {result.data_liberacao_ecoordin || 'N/A'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatusItem label="RH" value={result.rh} />
                  <StatusItem label="SAÚDE" value={result.saude} />
                  <StatusItem label="SEGURANÇA" value={result.seguranca} />
                  <StatusItem label="GRD" value={result.grd} />
                  <div className="col-span-full">
                    <StatusItem label="ÁREA AUTORIZADA" value={result.area} />
                  </div>
                </div>

                {result.obs_grd && (
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                    <span className="text-[10px] font-black text-amber-600/70 uppercase block mb-1 tracking-widest font-display">Observações</span>
                    <p className="text-xs text-app-text font-medium leading-relaxed italic opacity-80">"{result.obs_grd}"</p>
                  </div>
                )}

                <button
                  onClick={handleClear}
                  className="btn-primary w-full h-16 text-sm"
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>
          </motion.div>
        ) : loading ? null : (
          (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.2em] font-display">Filtrados</span>
                <span className="text-[10px] font-black text-white bg-brand-primary px-3 py-1 rounded-full font-display shadow-md shadow-blue-500/20">{filteredList.length}</span>
              </div>
              {filteredList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[40px] border border-app-border shadow-soft">
                  <div className="w-16 h-16 bg-app-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-app-text-muted opacity-20" size={24} />
                  </div>
                  <span className="text-xs font-bold text-app-text-muted opacity-40 uppercase tracking-widest font-display">Nada encontrado</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 pb-12">
                  {filteredList.map((item, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleSelectSuggestion(item)}
                      className="card-floating flex justify-between items-center active:scale-[0.98] transition-all text-left group gap-4 border-none"
                    >
                      <div className="flex items-center gap-4 flex-1 truncate">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isReleased(item.data_liberacao_ecoordin) ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {isReleased(item.data_liberacao_ecoordin) ? (
                            <Zap size={20} fill="currentColor" />
                          ) : (
                            <Lock size={20} />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 truncate">
                          <span className="text-sm font-black text-app-text uppercase truncate font-display">{item.nome}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-app-text-muted opacity-60">MAT: {item.mat}</span>
                            <span className="w-1 h-1 rounded-full bg-app-border" />
                            <span className="text-[10px] font-bold text-app-text-muted opacity-60 uppercase truncate">{item.funcao}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-app-text-muted opacity-20 group-hover:text-brand-primary group-hover:opacity-100 transition-all" />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default App;

