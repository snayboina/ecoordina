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
import { fetchCollaborators, calculateLeadTime, login, fetchLiberationByMat, fetchLiberationData } from './services/api';
import type { Collaborator, RequesterSession, LiberationData } from './types';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const START_DATE = dayjs('2026-01-01');
const END_DATE = dayjs('2026-03-31');

const ModernMobileSimulator: React.FC<{ children: React.ReactNode, header?: React.ReactNode, footer?: React.ReactNode }> = ({ children, header, footer }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 md:p-10 font-sans overflow-hidden">
      {/* Device Frame */}
      <div className="relative w-full h-[100dvh] sm:w-[400px] sm:h-[820px] bg-slate-900 sm:rounded-[4rem] sm:p-3.5 sm:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-500 border-slate-800 sm:border-[10px] relative">

        {/* Physical Buttons Simulation - Only on larger screens */}
        <div className="hidden sm:block absolute -left-[14px] top-32 w-[4px] h-12 bg-slate-800 rounded-l-md border-y border-white/5 shadow-inner" /> {/* Action Button / Mute */}
        <div className="hidden sm:block absolute -left-[14px] top-48 w-[4px] h-16 bg-slate-800 rounded-l-md border-y border-white/5 shadow-inner" /> {/* Vol Up */}
        <div className="hidden sm:block absolute -left-[14px] top-68 w-[4px] h-16 bg-slate-800 rounded-l-md border-y border-white/5 shadow-inner" /> {/* Vol Down */}
        <div className="hidden sm:block absolute -right-[14px] top-44 w-[4px] h-24 bg-slate-800 rounded-r-md border-y border-white/5 shadow-inner" /> {/* Power Button */}

        {/* Dynamic Island Style Notch - Only on larger screens */}
        <div className="hidden sm:flex absolute top-6 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-[100] items-center justify-center border border-white/5 shadow-xl">
          <div className="w-1.5 h-1.5 bg-slate-900/50 rounded-full ml-auto mr-4 border border-white/5" />
          <div className="w-2.5 h-2.5 bg-[#0a0a0a] rounded-full mr-2 flex items-center justify-center">
            <div className="w-1 h-1 bg-indigo-500/20 rounded-full blur-[1px]" />
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="flex-1 w-full bg-app-bg overflow-hidden sm:rounded-[3.2rem] relative flex flex-col shadow-inner">
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
          <div className="hidden sm:flex flex-none h-6 items-center justify-center pb-2 bg-app-bg">
            <div className="w-32 h-1 bg-app-indicator/10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-app-glow blur-[120px] rounded-full pointer-events-none -z-10 opacity-30" />
    </div>
  );
};

const WelcomeView: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="relative h-full flex flex-col overflow-hidden">
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-16 max-w-4xl mx-auto w-full">
      <div className="w-full flex flex-col items-center mb-12">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
            <Zap className="text-white" size={24} fill="currentColor" />
          </div>
          <span className="font-black text-base uppercase tracking-wider text-app-text">
            Ecoordina<span className="text-brand-primary">Smart</span>
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-app-text tracking-tighter leading-[0.95]">
            Sua jornada <br />
            operacional <br />
            começa <span className="text-brand-primary">aqui.</span>
          </h1>
          <p className="text-app-text-secondary text-lg md:text-xl leading-relaxed max-w-xl mx-auto font-medium opacity-80">
            Bora saber se está liberado para as suas atividades!
          </p>
        </div>
      </div>

      <div className="relative w-full max-w-lg aspect-square mb-12 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute w-full h-full bg-brand-primary/5 rounded-full blur-[100px]"
        />
        <motion.img
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          src="https://res.cloudinary.com/duyb5dsw0/image/upload/v1769556456/Whisk_d93805c8624cb73b747439948d305d92eg_plg0wt.png"
          className="relative z-10 w-full h-full object-cover rounded-[40px] border-4 border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]"
        />
      </div>
    </div>

    <div className="p-8 md:p-12 w-full max-w-2xl mx-auto">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="btn-primary w-full h-16 md:h-20 text-lg md:text-xl shadow-2xl shadow-orange-500/30 rounded-[2rem]"
      >
        Acessar Plataforma
      </motion.button>
      <div className="mt-8 flex justify-center items-center gap-3 opacity-30 grayscale saturate-0">
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
    <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 bg-white relative overflow-hidden min-h-[80dvh]">
      <div className="w-full max-w-xl space-y-12 relative z-10 py-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
              <Zap className="text-white" size={28} fill="currentColor" />
            </div>
            <span className="font-black text-xl uppercase tracking-wider text-app-text">
              Ecoordina<span className="text-brand-primary">Smart</span>
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black text-app-text tracking-tighter">Login</h2>
            <p className="text-app-text-secondary text-sm md:text-base font-medium opacity-60">Acesse sua conta para continuar</p>
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
  const [view, setView] = useState<'welcome' | 'login' | 'menu' | 'content'>('welcome');
  const [activeTab, setActiveTab] = useState<'dash' | 'list' | 'lead' | 'lib'>('dash');
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



  if (view === 'welcome') {
    return (
      <ModernMobileSimulator>
        <WelcomeView onNext={() => {
          if (session) {
            setView('content');
            setActiveTab('lib');
          } else {
            setView('login');
          }
        }} />
      </ModernMobileSimulator>
    );
  }

  if (view === 'login' || !session) {
    return (
      <ModernMobileSimulator>
        <LoginView onLogin={handleLogin} onBack={() => setView('welcome')} />
      </ModernMobileSimulator>
    );
  }


  return (
    <ModernMobileSimulator header={headerBar}>
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
  <div className="bg-app-card border border-app-border p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
    <span className="text-[9px] font-bold text-app-secondary/40 uppercase tracking-tighter">{label}</span>
    <span className={`text-xs font-black ${(value || '').toUpperCase() === 'OK' ? 'text-emerald-400' : (value || '').toUpperCase() === 'PENDENTE' ? 'text-red-400' : 'text-app-text/40'}`}>
      {value || '-'}
    </span>
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

  const START_FILTER_DATE = dayjs('2025-12-09');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const data = await fetchLiberationData();
      console.log('Dados de liberação carregados:', data);
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
    setSearch(item.nome); // Mostra o nome selecionado
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

    // Tenta encontrar nos dados locais primeiro
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
    if (!item.data_liberacao_ecoordin) return false;
    // Tenta limpar espaços extras que o n8n/Sheets podem ter enviado
    const dateStr = item.data_liberacao_ecoordin.trim();
    const date = dayjs(dateStr, 'DD/MM/YYYY');
    if (!date.isValid()) return false;

    const isAfterStart = date.isAfter(START_FILTER_DATE) || date.isSame(START_FILTER_DATE, 'day');

    // Se um mês específico estiver selecionado, não trava na data de hoje
    const isBeforeToday = monthFilter !== 'ALL' || date.isBefore(dayjs(), 'day') || date.isSame(dayjs(), 'day');

    if (!isAfterStart || !isBeforeToday) return false;

    const matchesMonth = monthFilter === 'ALL' || (monthFilter === 'DEC' ? date.month() === 11 : monthFilter === 'JAN' ? date.month() === 0 : true);
    const matchesRole = roleFilter === 'ALL' || item.funcao === roleFilter;

    return matchesMonth && matchesRole;
  });

  const uniqueRoles = Array.from(new Set(allData.map(d => d.funcao).filter(Boolean))).sort();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-4 pb-24">
      <div className="bg-app-card border border-app-border p-6 rounded-[2.5rem] space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-base font-black flex items-center gap-3">
              <Lock className="text-brand-primary" size={20} />
              Check de Liberação
            </h3>
            <p className="text-[11px] text-app-secondary font-medium uppercase tracking-tight">Consulte o status de acesso ao projeto.</p>
          </div>
          <div className="flex flex-col gap-2 min-w-[120px]">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-ice-white border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold text-app-text outline-none focus:border-brand-primary/50 transition-all"
            >
              <option value="ALL">🗓️ Todos os Meses</option>
              <option value="DEC">📅 Dezembro</option>
              <option value="JAN">📅 Janeiro</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-ice-white border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold text-app-text outline-none focus:border-brand-primary/50 transition-all max-w-[150px]"
            >
              <option value="ALL">🛠️ Todas Funções</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-secondary/40" size={18} />
            <input
              type="text"
              className="w-full bg-app-card border border-app-border rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-brand-primary/50 transition-all font-mono text-app-text"
              placeholder="Matrícula ou Nome..."
              value={search}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => search.length > 1 && setShowSuggestions(true)}
            />
            <button type="submit" className="hidden" />

            {/* Autocomplete Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-[-85px] mt-2 bg-app-bg border border-app-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {suggestions.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full px-6 py-5 flex flex-col gap-1.5 hover:bg-app-card border-b border-app-border last:border-0 text-left transition-colors"
                    >
                      <span className="text-sm font-black text-app-text uppercase tracking-tight">{item.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-brand-primary font-bold bg-brand-primary/10 px-2 py-1 rounded-md">MAT: {item.mat}</span>
                        <span className="text-[10px] text-app-secondary font-medium">{item.funcao}</span>
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
              className="px-4 bg-app-card border border-app-border rounded-2xl text-[10px] font-black text-brand-primary uppercase tracking-widest active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Limpar
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {result && !loading ? (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-4">
            <div className={`p-10 rounded-[3rem] border-2 ${isReleased(result.data_liberacao_ecoordin) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'} relative overflow-hidden shadow-2xl shadow-brand-primary/5`}>
              <div className="relative z-10 flex flex-col gap-8">
                <div>
                  <span className="text-[11px] font-black text-app-secondary uppercase tracking-widest bg-app-card px-3 py-1.5 rounded-lg border border-app-border">MAT: {result.mat}</span>
                  <h2 className={`text-2xl font-black mt-4 uppercase tracking-tighter leading-tight ${isReleased(result.data_liberacao_ecoordin) ? 'text-app-text' : 'text-red-500'}`}>{result.mat} - {result.nome}</h2>
                  <p className="text-app-secondary text-base font-bold mt-1 uppercase tracking-tight">{result.funcao}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-app-bg rounded-2xl border border-app-border">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-app-secondary/40 uppercase tracking-wider">Status E-COORDINA</span>
                    <span className={`text-xl font-black ${isReleased(result.data_liberacao_ecoordin) ? 'text-emerald-400' : 'text-red-400'} tracking-widest`}>
                      {isReleased(result.data_liberacao_ecoordin) ? 'LIBERADO' : 'NÃO LIBERADO'}
                    </span>
                    <span className="text-[10px] text-app-secondary font-mono mt-0.5">{result.data_liberacao_ecoordin || 'Sem data definida'}</span>
                  </div>
                  {isReleased(result.data_liberacao_ecoordin) ? (
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <Zap className="text-emerald-400" size={32} fill="currentColor" />
                    </motion.div>
                  ) : (
                    <Lock className="text-red-400" size={32} />
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <StatusItem label="RH" value={result.rh} />
                  <StatusItem label="SAÚDE" value={result.saude} />
                  <StatusItem label="SEGURANÇA" value={result.seguranca} />
                  <StatusItem label="GRD" value={result.grd} />
                  <div className="col-span-full">
                    <StatusItem label="ÁREA" value={result.area} />
                  </div>
                </div>

                {result.obs_grd && (
                  <div className="p-3 bg-app-card rounded-xl border border-app-border">
                    <span className="text-[9px] font-bold text-app-secondary uppercase block mb-1">Observação GRD</span>
                    <p className="text-[11px] text-app-text/60 leading-relaxed">{result.obs_grd}</p>
                  </div>
                )}

                <button
                  onClick={handleClear}
                  className="w-full py-4 bg-app-bg border border-app-border rounded-2xl text-xs font-black text-brand-primary uppercase tracking-widest active:scale-95 transition-all mt-2"
                >
                  Voltar para a lista
                </button>
              </div>

              {/* Background Decor */}
              <div className={`absolute -right-20 -bottom-20 w-64 h-64 blur-[80px] rounded-full opacity-20 ${isReleased(result.data_liberacao_ecoordin) ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
          </motion.div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <span className="text-xs font-bold text-app-secondary uppercase tracking-widest animate-pulse">Sincronizando dados com a planilha...</span>
          </div>
        ) : (
          (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 px-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-app-text/40 uppercase tracking-widest">Liberados no Período</span>
                <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">{filteredList.length}</span>
              </div>
              {filteredList.length === 0 ? (
                <div className="text-center py-10 bg-app-card rounded-3xl border border-app-border">
                  <span className="text-sm text-app-secondary">Nenhum registro para este filtro.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
                  {filteredList.map((item, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full bg-app-card border border-app-border p-5 rounded-2xl flex justify-between items-center active:scale-95 transition-all text-left group hover:border-brand-primary/30"
                    >
                      <div className="flex flex-col gap-1 max-w-[70%]">
                        <span className={`text-sm font-bold truncate group-hover:text-brand-primary transition-colors ${isReleased(item.data_liberacao_ecoordin) ? 'text-app-text' : 'text-red-500'}`}>{item.mat} - {item.nome}</span>
                        <span className="text-[10px] text-app-secondary truncate opacity-60 uppercase font-black">{item.funcao}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-lg border border-brand-primary/10">
                          {item.data_liberacao_ecoordin}
                        </span>
                        <ChevronRight size={16} className="text-app-text/20 group-hover:text-brand-primary/40 transition-all" />
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
