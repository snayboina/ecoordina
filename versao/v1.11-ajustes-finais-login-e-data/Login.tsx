import React, { useState } from 'react';
import { Mail, Eye, EyeOff, Zap, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkUserAccess } from './services/api';
import dayjs from 'dayjs';

interface LoginProps {
    onLogin: (email: string, password: string, userData?: { name: string; role?: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalData, setModalData] = useState<{ open: boolean; days: number; date: string; name: string } | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const user = await checkUserAccess(email, password);

        if (user) {
            setModalData({
                open: true,
                days: user.access_days || 0,
                date: user.data_cadastro ? dayjs(user.data_cadastro).format('DD/MM/YYYY') : '-',
                name: user.nome || 'Gestor'
            });
        } else {
            setError('Credenciais inválidas ou acesso não encontrado.');
        }
        setIsLoading(false);
    };

    const handleContinue = () => {
        const userData = modalData ? { name: modalData.name, role: 'USUÁRIO' } : undefined;
        setModalData(null);
        onLogin(email, password, userData);
    };

    return (
        <div className="min-h-screen w-full relative bg-[#1e293b] overflow-hidden font-sans text-slate-900 selection:bg-rose-500/30">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#1e293b] to-[#0f172a] opacity-90 pointer-events-none" />

            {/* Gradient Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

            {/* Main Content Container */}
            <div className="relative z-10 container mx-auto px-6 min-h-screen flex flex-col">

                {/* Header Navbar */}
                <header className="flex justify-between items-center py-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#b05d75] rounded-full flex items-center justify-center shadow-lg shadow-rose-900/20">
                            <Zap size={20} className="text-white" fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black tracking-wider text-xl leading-none">ECOORDINA</span>
                            <span className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">SMART</span>
                        </div>
                    </div>
                </header>

                {/* Hero Content (Split Layout) */}
                <main className="flex-1 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10 pb-8 lg:pb-0">

                    {/* Left Column: Text Content */}
                    <div className="flex flex-col justify-center space-y-8 max-w-2xl px-4 lg:px-0">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight"
                        >
                            Facilite sua <br />
                            <span className="text-[#b05d75]">operação</span> com o <br />
                            <span className="text-white/90">ECOORDINA</span> <br />
                            <span className="text-[#94a3b8]">SMART</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-slate-400 text-lg md:text-xl leading-relaxed font-medium max-w-lg"
                        >
                            O Ecoordina Smart oferece uma gestão eficiente e integrada das liberações operacionais, tudo em tempo real. Acompanhe status da equipe, gerencie acessos e otimize processos com facilidade.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="flex flex-wrap items-center gap-4 pt-4"
                        >
                            <div className="flex items-center gap-2 text-white/60 text-sm font-bold">
                                <CheckCircle size={16} className="text-emerald-400" />
                                <span>Monitoramento 24/7</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60 text-sm font-bold">
                                <CheckCircle size={16} className="text-emerald-400" />
                                <span>Gestão em Tempo Real</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60 text-sm font-bold">
                                <CheckCircle size={16} className="text-emerald-400" />
                                <span>Francis Developer</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Login Form */}
                    <div className="flex items-center justify-center lg:justify-end w-full">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, x: 20 }}
                            animate={{ scale: 1, opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            {/* Form Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b05d75]/20 rounded-full blur-[60px] pointer-events-none" />

                            <div className="mb-8 relative z-10">
                                <h2 className="text-2xl font-black text-white mb-2">Acesse sua conta</h2>
                                <p className="text-slate-300 font-bold text-sm">Bem-vindo à sua central de controle</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider ml-1">E-mail</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-white transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:bg-slate-900/80 focus:border-[#b05d75] focus:ring-1 focus:ring-[#b05d75] transition-all outline-none font-bold text-sm text-white placeholder-slate-500"
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider ml-1">Senha</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-white transition-colors" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:bg-slate-900/80 focus:border-[#b05d75] focus:ring-1 focus:ring-[#b05d75] transition-all outline-none font-bold text-sm text-white placeholder-slate-500"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-rose-500/10 text-rose-300 text-xs font-bold text-center border border-rose-500/20">
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#b05d75] hover:bg-[#9d4d63] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/30 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                                >
                                    {isLoading ? "Processando..." : "Entrar"}
                                </button>

                                <div className="text-center mt-4">
                                    <button type="button" className="text-xs text-slate-400 hover:text-white font-bold transition-colors">Esqueceu sua senha?</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </main>

                {/* Footer Spacer */}
                <div className="h-12 hidden md:block" />
            </div>

            {/* Access Success Modal */}
            <AnimatePresence>
                {modalData?.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-md z-[60] flex items-center justify-center p-6"
                        onClick={handleContinue}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center"
                        >
                            <div className="w-20 h-20 bg-[#b05d75] rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-rose-900/20">
                                <CheckCircle size={40} className="text-white" />
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mb-2">Acesso Liberado</h2>
                            <p className="text-slate-400 font-bold text-sm mb-10">Bem-vindo(a), {modalData.name}</p>

                            <div className="w-full space-y-3 mb-10">
                                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Dias Restantes</span>
                                    <span className="text-2xl font-black text-[#b05d75]">{modalData.days}</span>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cadastro</span>
                                    <span className="text-sm font-black text-slate-700">{modalData.date}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full h-14 bg-[#b05d75] hover:bg-[#9d4d63] text-white font-black rounded-2xl shadow-xl shadow-rose-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                Ir para o Painel
                                <ChevronRight size={20} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
