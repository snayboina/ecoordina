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

            <div className="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-24 items-center relative z-10 px-6 md:px-12">
                {/* Left Column: Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-10 py-10"
                >
                    {/* Logotipo */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#b05d75] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Zap className="text-white" size={32} fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black tracking-widest text-3xl leading-none">ECOORDINA</span>
                            <span className="text-[#b05d75] text-sm font-bold tracking-[0.4em]">SMART SaaS</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-6xl md:text-8xl font-black text-white leading-[1] tracking-tighter">
                        Facilite sua operação com o <span className="text-[#aaa0c0] block mt-2">ECOORDINA SMART</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-white/70 text-xl md:text-2xl max-w-xl leading-relaxed font-medium">
                        O Ecoordina Smart oferece uma gestão eficiente e integrada das liberações operacionais, tudo em tempo real.
                    </p>

                    {/* CTA Button */}
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(176, 93, 117, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onEnter}
                        className="bg-[#b05d75] text-white px-12 py-6 rounded-[2rem] font-black text-2xl flex items-center gap-4 transition-all shadow-2xl"
                    >
                        Entrar
                        <ArrowRight size={28} strokeWidth={3} />
                    </motion.button>
                </motion.div>

                {/* Right Column: Mockups */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="relative flex items-center justify-center lg:justify-end"
                >
                    {/* Notebook Mockup - SCALE UP */}
                    <div className="relative w-full aspect-[16/10] bg-slate-800 rounded-[3rem] p-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border-[12px] border-slate-700/50 transform scale-110 lg:scale-[1.3] origin-center lg:origin-right">
                        <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden shadow-inner">
                            <img
                                src="https://res.cloudinary.com/duyb5dsw0/image/upload/v1770158803/Captura_de_tela_2026-02-03_194626_x3ja7n.png"
                                className="w-full h-full object-cover"
                                alt="Dashboard Web"
                            />
                        </div>
                    </div>

                    {/* Mobile Mockup (Overlay) - SCALE UP AND POSITION */}
                    <motion.div
                        initial={{ y: 50, opacity: 0, x: -30 }}
                        animate={{ y: 0, opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="absolute -left-8 -bottom-16 lg:-left-20 lg:-bottom-24 w-[32%] lg:w-[35%] aspect-[1/2] bg-black rounded-[3.5rem] p-3 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border-[10px] border-slate-900 z-10"
                    >
                        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                            <img
                                src="https://res.cloudinary.com/duyb5dsw0/image/upload/v1770158803/Captura_de_tela_2026-02-03_194040_q5vyes.png"
                                className="w-full h-full object-cover"
                                alt="App Mobile"
                            />
                        </div>
                        {/* Dynamic Island */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Subtle decorative elements */}
            <div className="absolute bottom-10 left-10 text-white/10 font-black text-9xl select-none leading-none">
                ECO
            </div>
        </div>
    );
};

export default WelcomeHero;
