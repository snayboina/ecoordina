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
        <div className="flex-1 w-full bg-app-bg overflow-hidden lg:rounded-[3.2rem] relative flex flex-col shadow-inner lg:pt-20 transition-all duration-700">
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
            <div className={`w-32 h-1 rounded-full transition-colors duration-700 ${isSilver ? 'bg-slate-200' : isGold ? 'bg-amber-100' : 'bg-app-indicator/10'}`} />
          </div>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none -z-10 opacity-30 transition-colors duration-1000 ${isGold ? 'bg-amber-500' : isSilver ? 'bg-blue-400' : 'bg-app-glow'}`} />
    </div>
  );
};

const WelcomeView: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="relative h-full flex flex-col overflow-hidden">
    <div className="flex-1 flex flex-col items-center text-center px-6 md:px-10 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-4 mt-2 sm:mt-12">
        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Zap className="text-white" size={20} fill="currentColor" />
        </div>
        <span className="font-black text-sm uppercase tracking-wider text-app-text">
          Ecoordina<span className="text-brand-primary">Smart</span>
        </span>
      </div>

      <div className="w-full flex flex-col items-center mb-6">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-app-text tracking-tighter leading-[0.95]">
            Sua jornada <br />
            operacional <br />
            começa <span className="text-brand-primary">aqui.</span>
          </h1>
          <p className="text-app-text-secondary text-base md:text-lg leading-relaxed max-w-xs mx-auto font-medium opacity-80">
            Bora saber se está liberado para as suas atividades!
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="relative w-full max-w-[240px] aspect-square mb-6 flex items-center justify-center cursor-pointer outline-none bg-transparent border-none p-0 group"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute w-full h-full bg-brand-primary/10 rounded-full blur-[80px] group-hover:bg-brand-primary/20 transition-colors"
        />
        <motion.img
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          src="https://res.cloudinary.com/duyb5dsw0/image/upload/v1769556456/Whisk_d93805c8624cb73b747439948d305d92eg_plg0wt.png"
          className="relative z-10 w-full h-full object-cover rounded-[32px] border-2 border-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all"
        />
      </motion.button>
    </div>

    <div className="p-6 md:p-10 w-full max-w-2xl mx-auto pb-10">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="btn-primary w-full h-16 md:h-20 text-lg md:text-xl shadow-2xl shadow-orange-500/30 rounded-[2rem]"
      >
        Acessar Plataforma
      </motion.button>
      <div className="mt-6 flex justify-center items-center gap-3 opacity-30 grayscale saturate-0">
        <div className="h-px w-8 bg-current" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logística Integrada</span>
        <div className="h-px w-8 bg-current" />
      </div>
    </div>
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
    <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-8 bg-white relative overflow-hidden min-h-[80dvh]">
      <div className="w-full max-w-md space-y-8 relative z-10 py-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-xl shadow-orange-500/20">
              <Zap className="text-white" size={20} fill="currentColor" />
            </div>
            <span className="font-black text-base uppercase tracking-wider text-app-text">
              Ecoordina<span className="text-brand-primary">Smart</span>
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black text-app-text tracking-tighter">Login</h2>
            <p className="text-app-text-secondary text-xs md:text-sm font-medium opacity-60">Acesse sua conta para continuar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-app-text font-black opacity-40 ml-1">E-mail Corporativo</label>
            <div className="relative group">
              <input
                type="email"
                required
                className="w-full bg-ice-white border-2 border-slate-100 rounded-2xl py-5 px-6 outline-none focus:border-brand-primary focus:bg-white transition-all text-base text-app-text font-medium shadow-sm"
                placeholder="francis.rosa@elecnor.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-app-text font-black opacity-40 ml-1">Senha de Acesso</label>
            <div className="relative group">
              <input
                type="password"
                required
                className="w-full bg-ice-white border-2 border-slate-100 rounded-2xl py-5 px-6 outline-none focus:border-brand-primary focus:bg-white transition-all text-base text-app-text font-medium shadow-sm"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/80 border border-slate-100 flex items-center justify-center text-slate-400 group-focus-within:text-brand-primary transition-colors">
                <Lock size={18} />
              </div>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-orange-50 text-orange-600 text-sm rounded-2xl border-2 border-orange-100/50 font-bold text-center">
              {error}
            </motion.div>
          )}

          <div className="pt-8 flex flex-col gap-6">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-16 md:h-20 text-lg shadow-2xl shadow-orange-500/30 rounded-[2rem]"
            >
              {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Iniciar Sessão"}
            </motion.button>
            <button type="button" onClick={onBack} className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-extrabold self-center hover:text-brand-primary transition-colors">
              Voltar ao Início
            </button>
          </div>
        </form>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full" />
    </div>
  );
};

const DashboardCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, delay?: number }> = ({ title, value, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col gap-3 shadow-sm"
  >
    <div className="flex justify-between items-start">
      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-brand-primary">
        {icon}
      </div>
      <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{title}</span>
    </div>
    <h3 className="text-3xl font-black text-app-text tracking-tighter leading-none">{value}</h3>
  </motion.div>
);




const App: React.FC = () => {
  const [view, setView] = useState<'welcome' | 'login' | 'content'>('welcome');
  const [activeTab, setActiveTab] = useState<'lib' | 'lead' | 'list' | 'dash'>('lib');
  const [frameStyle, setFrameStyle] = useState<'midnight' | 'silver' | 'gold'>('midnight');
  const [data, setData] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  /* Restaurando sessão */
  const [session, setSession] = useState<RequesterSession | null>(() => {
    const saved = localStorage.getItem('mob_session');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (session) {
      setView('content');
      setActiveTab('lib');
      loadData();
    }
  }, [session]);

  // Logout automático por inatividade (20 minutos)
  useEffect(() => {
    let timer: any;

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


  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    const result = await fetchCollaborators();

    // Filtro por Solicitante Logado + Data Q1 2026
    const filtered = result.filter(c => {
      const matchRequester = String(c.requester || '').trim().toUpperCase() === session.name.trim().toUpperCase();
      return matchRequester;
    });

    // Se o usuário não tem área no session, tenta pegar do primeiro registro encontrado
    if (!session.area && filtered.length > 0) {
      const userArea = filtered[0].area;
      if (userArea) {
        const updatedSession = { ...session, area: userArea };
        setSession(updatedSession);
        localStorage.setItem('mob_session', JSON.stringify(updatedSession));
      }
    }

    // Filtro final por data
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
    <div className="flex flex-col bg-white border-b border-app-border">
      <div className="px-6 py-4 flex justify-between items-center relative z-10 max-w-7xl mx-auto w-full">
        <button
          onClick={() => setView('welcome')}
          className="w-10 h-10 rounded-[1rem] bg-orange-50 flex items-center justify-center text-brand-primary active:scale-90 transition-all shadow-sm"
        >
          <ChevronRight size={22} className="rotate-180" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-black text-brand-primary uppercase tracking-widest leading-none mb-1 text-center">
            Seja bem-vindo: {session?.name?.split(' ')[0]}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-[1rem] bg-orange-50 flex items-center justify-center text-brand-primary active:scale-90 transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>

      <div className="h-[2px] w-full bg-orange-50 overflow-hidden relative">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="absolute inset-0 bg-brand-primary"
        />
      </div>

      <AnimatePresence>
        {activeTab === 'list' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-4 overflow-hidden"
          >
            <div className="relative mt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Buscar em Pipeline..."
                className="w-full bg-ice-white border border-slate-100 rounded-xl py-4 pl-12 pr-4 focus:border-brand-primary/50 outline-none text-sm transition-all text-app-text font-medium"
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
            onClick={() => setFrameStyle(style.id as any)}
            className={`flex flex-col items-center gap-2 group transition-all ${frameStyle === style.id ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`w-12 h-12 ${style.color} rounded-2xl shadow-lg border-2 ${frameStyle === style.id ? 'border-brand-primary active' : 'border-white'} transition-all`} />
            <span className={`text-[9px] font-bold uppercase tracking-widest ${frameStyle === style.id ? 'text-brand-primary' : 'text-slate-400'}`}>{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

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
                <motion.div key="dash" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DashboardCard title="Mobilização" value={stats.active} icon={<Users size={22} />} delay={0.1} />
                    <DashboardCard title="Lead Time" value={`${stats.avgLeadTime}d`} icon={<Timer size={22} />} delay={0.2} />
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const allStatuses = [
                        'EM SELEÇÃO',
                        'AGUARDANDO DOCUMENTOS',
                        'AGUARDANDO ASO',
                        'AGUARDANDO VIAGEM',
                        'SUBSTITUIR',
                        'TRANSFERIDO',
                        'LANÇAR NO RM',
                        'STAND BY',
                        'AGUARDANDO ACEITE DA CARTA',
                        'ADMITIDO'
                      ];

                      const statusCounts = allStatuses.map(status => ({
                        name: status,
                        count: data.filter(c => c.status === status).length
                      }));

                      const admitidos = statusCounts.find(s => s.name === 'ADMITIDO') || { name: 'ADMITIDO', count: 0 };

                      // Outros status excluindo ADMITIDO para o fluxo normal
                      const otherStatuses = statusCounts.filter(s => s.name !== 'ADMITIDO');

                      // Ordenar outros status: Maiores primeiro, zeros por último
                      const sortedStatuses = otherStatuses.sort((a, b) => {
                        if (a.count === 0 && b.count > 0) return 1;
                        if (a.count > 0 && b.count === 0) return -1;
                        return b.count - a.count;
                      });

                      // Separar os top 4 (Principais) dos secundários
                      const mainStatuses = sortedStatuses.slice(0, 4);
                      const secondaryStatuses = sortedStatuses.slice(4);

                      return (
                        <div className="space-y-3">
                          {/* Hero Card: ADMITIDO */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30 p-5 rounded-3xl relative overflow-hidden group"
                          >
                            <div className="flex justify-between items-center relative z-10">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Concluído</span>
                                <h3 className="text-xl font-bold text-app-text tracking-tight">{admitidos.name}</h3>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{admitidos.count}</span>
                                <span className="text-[10px] text-app-secondary font-medium">No Período</span>
                              </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -right-4 -bottom-4 bg-emerald-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                            <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500/50" />
                          </motion.div>

                          <div className="pt-2">
                            <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md border border-brand-primary/20 uppercase font-bold tracking-tighter">Fluxo de Mobilização</span>
                          </div>

                          {/* Principais - Cards Largos */}
                          {mainStatuses.map((status, i) => {
                            const percentage = (status.count / (stats.active || 1)) * 100;
                            return (
                              <div key={status.name} className="bg-app-card p-4 rounded-xl border border-app-border overflow-hidden relative">
                                <div className="flex justify-between items-center mb-2 z-10 relative">
                                  <span className="text-xs font-semibold text-app-secondary">{status.name}</span>
                                  <span className="text-brand-primary font-bold">{status.count}</span>
                                </div>
                                <div className="h-1.5 w-full bg-app-notch rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: 0.3 + (i * 0.1), duration: 1 }}
                                    className="h-full bg-brand-primary"
                                  />
                                </div>
                              </div>
                            );
                          })}

                          {/* Secundários - Grid de 2 colunas */}
                          <div className="grid grid-cols-2 gap-3 pb-8">
                            {secondaryStatuses.map((status) => (
                              <div key={status.name} className="bg-app-card p-3 rounded-xl border border-app-border flex flex-col justify-between gap-1 transition-all active:scale-95">
                                <span className="text-[10px] font-bold text-app-secondary uppercase leading-tight">{status.name}</span>
                                <span className={`text-lg font-bold ${status.count > 0 ? 'text-brand-primary' : 'text-app-text opacity-20'}`}>
                                  {status.count}
                                </span>
                              </div>
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
                        <div className="flex flex-col items-center justify-center py-20 text-app-secondary gap-3">
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
                <LiberationView />
              )}

              {activeTab === 'lead' && (
                <motion.div key="lead" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 pt-4 pb-20">
                  <div className="bg-brand-primary/10 border border-brand-primary/20 p-5 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <Timer className="text-brand-primary" size={24} />
                      <h3 className="text-lg font-bold">Pipeline Mobilização</h3>
                    </div>
                    <p className="text-sm text-brand-primary/80">Acompanhe cada etapa da mobilização.</p>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-app-secondary font-bold uppercase tracking-wider">Filtrar:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex-1 bg-app-card border border-app-border rounded-xl px-3 py-2 text-sm text-app-text focus:outline-none focus:border-brand-primary/50 transition-colors"
                    >
                      <option value="TODOS" className="bg-app-bg text-app-text">📊 Todos os Status</option>
                      <option value="ADMITIDO" className="bg-app-bg text-app-text">✅ Admitido</option>
                      <option value="EM SELEÇÃO" className="bg-app-bg text-app-text">🔍 Em Seleção</option>
                      <option value="AGUARDANDO VIAGEM" className="bg-app-bg text-app-text">✈️ Aguardando Viagem</option>
                      <option value="AGUARDANDO DOCUMENTOS" className="bg-app-bg text-app-text">📄 Aguardando Documentos</option>
                      <option value="SUBSTITUIR" className="bg-app-bg text-app-text">🔄 Substituir</option>
                      <option value="LANÇAR NO RM" className="bg-app-bg text-app-text">📝 Lançar no RM</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {filteredData
                      .filter(c => c.status !== 'CANCELADO')
                      .filter(c => statusFilter === 'TODOS' || c.status === statusFilter)
                      .sort((a, b) => {
                        // Priorizar ADMITIDOS no topo
                        if (a.status === 'ADMITIDO' && b.status !== 'ADMITIDO') return -1;
                        if (a.status !== 'ADMITIDO' && b.status === 'ADMITIDO') return 1;
                        // Depois ordenar por quantidade de marcos concluídos
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
      className="bg-app-card border border-app-border rounded-2xl overflow-hidden transition-all"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left relative"
      >
        <div className="flex flex-col gap-1 max-w-[65%]">
          <h4 className={`font-bold text-sm ${collab.name === 'Aguardando Colaborador' ? 'text-emerald-400' : 'text-app-text'}`}>
            {collab.name}
          </h4>
          <p className="text-[10px] text-app-secondary uppercase tracking-wider">{collab.role}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 min-w-[80px]">
          <div className="flex flex-col items-end leading-none">
            <span className="text-sm font-black text-brand-primary leading-none transition-all">
              {selection.start !== null && selection.end !== null ? calculateDiff() : totalDays}
            </span>
            <span className="text-[8px] font-bold text-brand-primary uppercase tracking-tighter leading-none">
              {selection.start !== null && selection.end !== null ? 'CALCULADO' : 'DIAS'}
            </span>
          </div>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${collab.status === 'ADMITIDO' ? 'bg-green-500/20 text-green-400' : 'bg-brand-primary/20 text-brand-primary'}`}>
            {collab.status}
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} className="mt-0.5">
            <ChevronRight size={16} className="text-app-text opacity-20" />
          </motion.div>
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
    <motion.div layout className="bg-app-card border border-app-border rounded-2xl overflow-hidden transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left active:bg-app-card/50"
      >
        <div className="flex flex-col gap-0.5">
          <h4 className="font-bold text-sm text-app-text/90">{role}</h4>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{collaborators.length} Profissionais</span>
        </div>
        <div className="flex items-center gap-3">
          {collaborators.some(c => c.status !== 'ADMITIDO') && (
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          )}
          <motion.div animate={{ rotate: expanded ? 90 : 0 }}>
            <ChevronRight size={18} className="text-app-secondary/40" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-2 space-y-1 bg-app-bg/50">
              {collaborators.map((collab, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-app-card/40 border border-app-border">
                  <span className={`text-xs font-medium ${collab.name === 'Aguardando Colaborador' ? 'text-emerald-400/80' : 'text-app-text/70'}`}>
                    {collab.name}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${collab.status === 'ADMITIDO' ? 'bg-green-500/10 text-green-400' : 'bg-brand-primary/10 text-brand-primary'}`}>
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
  <div className="bg-app-card border-2 border-app-border p-3 rounded-[var(--radius-technical)] flex flex-col items-center justify-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
    <span className="text-[9px] font-black text-app-secondary/60 uppercase tracking-widest">{label}</span>
    <span className={`text-xs font-mono font-black ${(value || '').toUpperCase() === 'OK' ? 'text-emerald-500' : (value || '').toUpperCase() === 'PENDENTE' ? 'text-red-500' : 'text-app-text/40'}`}>
      {value || '-'}
    </span>
  </div>
);

const SkeletonItem: React.FC = () => (
  <div className="w-full bg-app-card border-2 border-app-border p-5 rounded-[var(--radius-technical)] flex justify-between items-center animate-pulse">
    <div className="flex flex-col gap-2 w-2/3">
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
    <div className="w-16 h-8 bg-slate-100 rounded" />
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

  const START_FILTER_DATE = dayjs('2025-12-09');

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
    const itemIsReleased = isReleased(item.data_liberacao_ecoordin);
    if (statusFilter === 'LIBERADO' && !itemIsReleased) return false;
    if (statusFilter === 'NAO_LIBERADO' && itemIsReleased) return false;

    if (statusFilter === 'NAO_LIBERADO') {
      if (!item.data_liberacao_ecoordin || item.data_liberacao_ecoordin.trim().length === 0) {
        return roleFilter === 'ALL' || item.funcao === roleFilter;
      }
    }

    if (!item.data_liberacao_ecoordin) return false;

    const dateStr = item.data_liberacao_ecoordin.trim();
    if (dateStr.length === 0) {
      if (statusFilter === 'NAO_LIBERADO') {
        return roleFilter === 'ALL' || item.funcao === roleFilter;
      }
      return false;
    }

    const date = dayjs(dateStr, 'DD/MM/YYYY');
    if (!date.isValid()) return false;

    const isAfterStart = date.isAfter(START_FILTER_DATE) || date.isSame(START_FILTER_DATE, 'day');
    const isBeforeToday = monthFilter !== 'ALL' || date.isBefore(dayjs(), 'day') || date.isSame(dayjs(), 'day');

    if (!isAfterStart || !isBeforeToday) return false;

    const matchesMonth = monthFilter === 'ALL' || (monthFilter === 'DEC' ? date.month() === 11 : monthFilter === 'JAN' ? date.month() === 0 : true);
    const matchesRole = roleFilter === 'ALL' || item.funcao === roleFilter;

    return matchesMonth && matchesRole;
  });

  const uniqueRoles = Array.from(new Set(allData.map(d => d.funcao).filter(Boolean))).sort();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-4 pb-24">
      <div className="bg-app-card border-2 border-app-border p-6 rounded-[var(--radius-technical)] shadow-[8px_8px_0px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-black flex items-center gap-3 uppercase tracking-tighter">
              <Lock className="text-brand-primary" size={20} />
              Check de Liberação
            </h3>
          </div>
          <div className="flex flex-row flex-wrap gap-2 w-full">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 bg-ice-white border-2 border-app-border rounded-[var(--radius-technical)] px-3 py-2 text-[10px] font-black text-app-text outline-none focus:border-brand-primary transition-all min-w-[120px]"
            >
              <option value="ALL">STATUS: TODOS</option>
              <option value="LIBERADO">STATUS: LIBERADOS</option>
              <option value="NAO_LIBERADO">STATUS: PENDENTES</option>
            </select>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="flex-1 bg-ice-white border-2 border-app-border rounded-[var(--radius-technical)] px-3 py-2 text-[10px] font-black text-app-text outline-none focus:border-brand-primary transition-all min-w-[120px]"
            >
              <option value="ALL">MÊS: TODOS</option>
              <option value="DEC">MÊS: DEZEMBRO</option>
              <option value="JAN">MÊS: JANEIRO</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 bg-ice-white border-2 border-app-border rounded-[var(--radius-technical)] px-3 py-2 text-[10px] font-black text-app-text outline-none focus:border-brand-primary transition-all min-w-[120px]"
            >
              <option value="ALL">FUNÇÃO: TODAS</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role ? `FUNÇÃO: ${role.toUpperCase()}` : 'SEM FUNÇÃO'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-secondary/40" size={18} />
            <input
              type="text"
              className="w-full bg-app-card border-2 border-app-border rounded-[var(--radius-technical)] py-4 pl-12 pr-12 outline-none focus:border-brand-primary transition-all font-mono text-app-text shadow-inner"
              placeholder="Matrícula ou Nome..."
              value={search}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => search.length > 1 && setShowSuggestions(true)}
            />
            <button type="submit" className="hidden" />

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="absolute top-full left-0 right-[-85px] mt-2 bg-white border-2 border-app-border rounded-[var(--radius-technical)] shadow-[12px_12px_0px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
                >
                  {suggestions.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full px-6 py-5 flex flex-col gap-1.5 hover:bg-slate-50 border-b-2 border-app-border last:border-0 text-left transition-colors"
                    >
                      <span className="text-sm font-black text-app-text uppercase tracking-tight">{item.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-brand-primary font-black bg-brand-primary/10 px-2 py-1 rounded-sm border border-brand-primary/20">MAT: {item.mat}</span>
                        <span className="text-[10px] text-app-secondary font-bold uppercase">{item.funcao}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          {(search || result) && (
            <button
              onClick={handleClear}
              className="px-4 bg-app-card border-2 border-app-border rounded-[var(--radius-technical)] text-[10px] font-black text-brand-primary uppercase tracking-widest active:translate-x-[2px] active:translate-y-[2px] transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.1)] flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Limpar
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 px-1">
            <div className="flex justify-between items-center mb-2">
              <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-8 animate-pulse" />
            </div>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-4 bg-red-400/10 border-2 border-red-400 rounded-[var(--radius-technical)] flex items-center gap-3 text-red-500 text-sm font-bold shadow-[4px_4px_0px_rgba(239,68,68,0.1)]">
            <AlertCircle size={18} />
            {error.toUpperCase()}
          </motion.div>
        )}

        {result && !loading ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
            <div className={`p-8 rounded-[var(--radius-technical)] border-2 ${isReleased(result.data_liberacao_ecoordin) ? 'bg-emerald-500/5 border-emerald-500' : 'bg-red-500/5 border-red-500'} relative overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,0.05)]`}>
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-deep-charcoal uppercase tracking-widest bg-white px-2 py-1 rounded-sm border-2 border-app-border shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">MAT: {result.mat}</span>
                  </div>
                  <h2 className={`text-2xl font-black mt-2 uppercase tracking-tighter leading-tight ${isReleased(result.data_liberacao_ecoordin) ? 'text-app-text' : 'text-red-600'}`}>
                    {result.nome}
                  </h2>
                  <p className="text-app-secondary text-sm font-black uppercase tracking-widest opacity-60 font-mono">{result.funcao}</p>
                </div>

                <div className="flex items-center justify-between p-5 bg-white rounded-sm border-2 border-app-border shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-app-secondary/60 uppercase tracking-widest">Status E-COORDINA</span>
                    <span className={`text-xl font-black ${isReleased(result.data_liberacao_ecoordin) ? 'text-emerald-500' : 'text-red-500'} tracking-tighter uppercase`}>
                      {isReleased(result.data_liberacao_ecoordin) ? '✓ LIBERADO' : '× PENDENTE'}
                    </span>
                    <span className="text-[11px] text-app-secondary font-mono font-bold mt-1 bg-slate-50 px-2 py-0.5 border border-slate-100">{result.data_liberacao_ecoordin || 'DATA NÃO DEFINIDA'}</span>
                  </div>
                  {isReleased(result.data_liberacao_ecoordin) ? (
                    <Zap className="text-emerald-500" size={36} fill="currentColor" />
                  ) : (
                    <div className="p-2 border-2 border-red-500 rounded-sm">
                      <Lock className="text-red-500" size={28} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatusItem label="RH" value={result.rh} />
                  <StatusItem label="SAÚDE" value={result.saude} />
                  <StatusItem label="SEGURANÇA" value={result.seguranca} />
                  <StatusItem label="GRD" value={result.grd} />
                  <div className="col-span-full">
                    <StatusItem label="ÁREA DE TRABALHO" value={result.area} />
                  </div>
                </div>

                {result.obs_grd && (
                  <div className="p-4 bg-white rounded-sm border-2 border-app-border shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
                    <span className="text-[10px] font-black text-app-secondary uppercase block mb-1 tracking-widest">Observações Técnicas (GRD)</span>
                    <p className="text-[11px] text-app-text font-mono leading-relaxed">{result.obs_grd}</p>
                  </div>
                )}

                <button
                  onClick={handleClear}
                  className="w-full py-4 bg-white border-2 border-app-border rounded-[var(--radius-button)] text-xs font-black text-brand-primary uppercase tracking-widest active:translate-x-[2px] active:translate-y-[2px] transition-all shadow-[4px_4px_0px_rgba(255,92,0,0.1)] mt-2"
                >
                  Voltar para a lista
                </button>
              </div>
            </div>
          </motion.div>
        ) : loading ? null : (
          (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 px-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-app-text/60 uppercase tracking-widest">Registro de Liberação</span>
                <span className="text-[10px] font-black text-white bg-deep-charcoal px-2 py-0.5 rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">{filteredList.length}</span>
              </div>
              {filteredList.length === 0 ? (
                <div className="text-center py-12 bg-app-card rounded-[var(--radius-technical)] border-2 border-app-border shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                  <span className="text-xs font-black text-app-secondary uppercase tracking-widest opacity-40">Nenhum registro encontrado</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                  {filteredList.map((item, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full bg-app-card border-2 border-app-border p-5 rounded-[var(--radius-technical)] flex justify-between items-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left group hover:border-brand-primary shadow-[4px_4px_0px_rgba(0,0,0,0.05)]"
                    >
                      <div className="flex flex-col gap-1.5 max-w-[70%]">
                        <span className={`text-sm font-black truncate group-hover:text-brand-primary transition-colors uppercase tracking-tighter ${isReleased(item.data_liberacao_ecoordin) ? 'text-app-text' : 'text-red-500'}`}>{item.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-app-secondary/60 font-black">{item.mat}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[9px] text-app-secondary/50 font-black uppercase truncate">{item.funcao}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-mono text-brand-primary font-black bg-brand-primary/5 px-2 py-0.5 rounded-sm border border-brand-primary/10">
                          {item.data_liberacao_ecoordin || 'PENDENTE'}
                        </span>
                        <ChevronRight size={14} className="text-app-text/20 group-hover:text-brand-primary transition-all" />
                      </div>
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

