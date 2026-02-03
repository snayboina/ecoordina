import React, { useState } from 'react';
import { Mail, Eye, EyeOff, ArrowRight, Zap, CheckCircle, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkUserAccess } from './services/api';

interface LoginProps {
    onLogin: (email: string, password: string) => void;
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
                date: user.data_cadastro || '-',
                name: user.nome || 'Gestor'
            });
        } else {
            setError('Credenciais inválidas ou acesso não encontrado.');
        }
        setIsLoading(false);
    };

    const handleContinue = () => {
        setModalData(null);
        onLogin(email, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8FAFC] font-sans text-gray-900 selection:bg-sage/20">
            {/* Subtle Dot Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center justify-center min-h-screen py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Brand Logo */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-14 h-14 bg-sage rounded-xl flex items-center justify-center shadow-md mb-5 transform hover:scale-105 transition-transform">
                            <Zap size={28} className="text-white" fill="currentColor" />
                        </div>
                        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-sm text-gray-500 font-medium">Sign in to your admin dashboard</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:border-sage focus:bg-white transition-all"
                                        placeholder="admin@ecoordina.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:border-sage focus:bg-white transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sage transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-sage text-white font-semibold rounded-xl shadow-md hover:bg-sage-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-8 font-medium">
                        © 2026 EcoordiaSmart. All rights reserved.
                    </p>
                </motion.div>
            </div>

            {/* Access Modal */}
            <AnimatePresence>
                {modalData?.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={handleContinue}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-sage rounded-xl flex items-center justify-center mb-6 shadow-md">
                                    <CheckCircle size={28} className="text-white" />
                                </div>

                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Granted</h2>
                                <p className="text-sm text-gray-500 mb-8">Welcome, {modalData.name}!</p>

                                <div className="w-full space-y-4 mb-8">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center">
                                                <Clock size={20} className="text-sage" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">Access Days</span>
                                        </div>
                                        <span className="text-lg font-semibold text-sage">{modalData.days}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-earth/10 rounded-lg flex items-center justify-center">
                                                <Calendar size={20} className="text-earth" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">Registered</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{modalData.date}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleContinue}
                                    className="w-full h-12 bg-sage text-white font-semibold rounded-xl shadow-md hover:bg-sage-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Continue to Dashboard
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
