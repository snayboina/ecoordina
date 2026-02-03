import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';

interface WelcomeHeroProps {
    onEnter: () => void;
}

const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onEnter }) => {
    return (
        <div className="min-h-screen w-full bg-[#47536f] flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans relative">
            {/* Background Gradient & Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#47536f] via-[#47536f] to-[#aaa0c0]/30 opacity-80" />
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#aaa0c0]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Column: Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    {/* Logotipo */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#b05d75] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Zap className="text-white" size={24} fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black tracking-widest text-2xl leading-none">ECOORDINA</span>
                            <span className="text-[#b05d75] text-xs font-bold tracking-[0.3em]">SMART SaaS</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                        Facilite sua operação com o <span className="text-[#aaa0c0]">ECOORDINA SMART</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
                        O Ecoordina Smart oferece uma gestão eficiente e integrada das liberações operacionais, tudo em tempo real.
                        Acompanhe status da equipe, gerencie acessos e otimize processos com facilidade.
                    </p>

                    {/* CTA Button */}
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(176, 93, 117, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onEnter}
                        className="bg-[#b05d75] text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 transition-all shadow-xl"
                    >
                        Entrar
                        <ArrowRight size={24} strokeWidth={3} />
                    </motion.button>
                </motion.div>

                {/* Right Column: Mockups */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="relative flex items-center justify-center"
                >
                    {/* Notebook Mockup */}
                    <div className="relative w-full aspect-[16/10] bg-slate-800 rounded-3xl p-1.5 shadow-2xl overflow-hidden border-8 border-slate-700">
                        <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-inner">
                            <img
                                src="https://res.cloudinary.com/duyb5dsw0/image/upload/v1770158803/Captura_de_tela_2026-02-03_194626_x3ja7n.png"
                                className="w-full h-full object-cover"
                                alt="Dashboard Web"
                            />
                        </div>
                    </div>

                    {/* Mobile Mockup (Overlay) */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="absolute -left-12 -bottom-12 w-[35%] aspect-[1/2] bg-black rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800"
                    >
                        <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                            <img
                                src="https://res.cloudinary.com/duyb5dsw0/image/upload/v1770158803/Captura_de_tela_2026-02-03_194040_q5vyes.png"
                                className="w-full h-full object-cover"
                                alt="App Mobile"
                            />
                        </div>
                        {/* Notch */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-4 bg-black rounded-full" />
                    </motion.div>
            </div>
        </div>

            {/* Subtle decorative elements */ }
    <div className="absolute bottom-10 left-10 text-white/10 font-black text-9xl select-none leading-none">
        ECO
    </div>
        </div >
    );
};

export default WelcomeHero;
