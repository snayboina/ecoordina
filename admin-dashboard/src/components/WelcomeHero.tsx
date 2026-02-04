import { motion } from "framer-motion";

interface WelcomeHeroProps {
    onEnter: () => void;
}

export default function WelcomeHero({ onEnter }: WelcomeHeroProps) {
    return (
        <div className="min-h-screen w-full bg-[#33394b] flex items-center justify-center overflow-hidden relative font-sans">

            {/* 🖼️ Fully Composed Background Image */}
            <div
                className="absolute inset-0 bg-no-repeat bg-center bg-cover sm:bg-contain transition-all duration-700"
                style={{
                    backgroundImage: "url('/bg-hero.png')",
                }}
            />

            {/* 🖱️ Interactive Hotzone: "Entrar" Button Overlay */}
            {/* 
          Since the background is 'cover' or 'contain', the actual position of the button inside the layout 
          is stable relative to the image itself. We use a container that mirrors the image's aspect ratio 
          if necessary, but here we'll use a responsive overlay strategy.
      */}
            <div className="relative w-full h-full max-w-[1920px] aspect-[16/10] mx-auto pointer-events-none">
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEnter}
                    className="absolute pointer-events-auto cursor-pointer flex items-center justify-center rounded-full transition-all border border-transparent hover:border-white/20"
                    style={{
                        // Percentage-based positioning to match the button in the 'bg-hero.png'
                        left: '6.2%',
                        bottom: '28%',
                        width: '14.5%',
                        height: '6.5%',
                        zIndex: 50
                    }}
                >
                    {/* Subtle glow effect on hover to show it's interactive */}
                    <div className="opacity-0 hover:opacity-100 transition-opacity absolute inset-0 bg-white/5 rounded-full blur-md" />
                </motion.button>
            </div>

            {/* Decorative Brand Text (Hidden by default, used for accessibility if needed) */}
            <span className="sr-only font-black">ECOORDINA SMART SaaS - Facilite sua operação</span>
        </div>
    );
}
