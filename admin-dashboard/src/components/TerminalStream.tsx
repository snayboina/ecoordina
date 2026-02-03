import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Database, Server, Shield, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import type { SyncLog } from '../types';

interface TerminalStreamProps {
    logs: SyncLog[];
}

const TerminalStream: React.FC<TerminalStreamProps> = ({ logs }) => {
    // Utility to get icon based on service/status
    const getIcon = (service: string) => {
        const s = service.toLowerCase();
        if (s.includes('auth')) return <Shield size={14} />;
        if (s.includes('db') || s.includes('database')) return <Database size={14} />;
        if (s.includes('server') || s.includes('api')) return <Server size={14} />;
        return <Activity size={14} />;
    };

    const getColor = (status: string | undefined) => {
        const s = status?.toLowerCase() || '';
        if (s === 'success' || s === 'ok') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        if (s === 'error' || s === 'failed') return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    };

    return (
        <div className="h-full w-full relative overflow-hidden bg-[#0A0F1C] font-mono p-8 flex justify-center">

            {/* Background Grid & Effects */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-[#0A0F1C]"></div>
            </div>

            {/* Central DNA Beam */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-blue-500/50 to-transparent -translate-x-1/2 z-0">
                <div className="absolute top-0 w-full h-full bg-blue-400/20 blur-[4px]"></div>
            </div>

            <div className="w-full max-w-4xl relative z-10 overflow-y-auto pr-4 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {logs.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-blue-500/5 border border-blue-500/20 text-blue-400 p-4 rounded-lg text-center text-xs uppercase tracking-widest mt-20"
                        >
                            Aguardando fluxo de dados...
                        </motion.div>
                    )}

                    {logs.map((log, index) => {
                        const isEven = index % 2 === 0;
                        const statusColor = getColor(log.status);
                        const isSuccess = log.status?.toLowerCase() === 'success';

                        return (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: isEven ? -50 : 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: index * 0.05 }}
                                className={`flex items-center gap-8 mb-6 relative w-full ${isEven ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Content Card */}
                                <div className={`flex-1 ${isEven ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block min-w-[300px] max-w-md bg-opacity-10 backdrop-blur-md border rounded-xl p-4 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:bg-opacity-20 transition-all group ${statusColor}`}>

                                        <div className={`flex items-center gap-3 mb-2 ${isEven ? 'justify-end' : 'justify-start'}`}>
                                            {!isEven && getIcon(log.service)}
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{log.service}</span>
                                            {isEven && getIcon(log.service)}
                                        </div>

                                        <p className="text-xs font-bold text-slate-200 leading-relaxed mb-3">
                                            {log.message}
                                        </p>

                                        <div className={`flex items-center gap-2 ${isEven ? 'justify-end' : 'justify-start'} opacity-60`}>
                                            <Clock size={10} />
                                            <span className="text-[9px] font-mono">{dayjs(log.created_at).format('HH:mm:ss.SSS')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Node Connector */}
                                <div className="relative shrink-0 w-8 h-8 flex items-center justify-center z-10">
                                    <div className={`absolute w-3 h-3 rounded-full ${isSuccess ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'} z-20`}></div>
                                    <div className={`absolute w-8 h-8 rounded-full border border-white/20 animate-ping opacity-20 ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                                    {/* Horizontal Line Connector */}
                                    <div className={`absolute top-1/2 w-8 h-[1px] bg-gradient-to-r ${isEven ? 'right-full from-transparent to-blue-500/50' : 'left-full from-blue-500/50 to-transparent'}`}></div>
                                </div>

                                {/* Empty space for alignment */}
                                <div className="flex-1"></div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TerminalStream;
