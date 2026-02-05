import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Shield, FileText, HeartPulse, HardHat, FileCheck } from 'lucide-react';
import type { Collaborator } from '../types';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

interface CollaboratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    collaborator: Collaborator | null;
}

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({ isOpen, onClose, collaborator }) => {
    if (!collaborator) return null;

    // Helper to determine status style
    const getStatusStyle = (status?: string) => {
        const s = status?.trim().toUpperCase() || 'PENDENTE';
        if (s === 'OK' || s === 'CONCLUIDO' || s === 'CONCLUÍDO' || s === 'LIBERADO') {
            return {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                border: 'border-emerald-100',
                icon: <CheckCircle2 size={18} className="text-emerald-500" />,
                label: 'CONCLUÍDO',
                dot: 'bg-emerald-400'
            };
        }
        return {
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-100',
            icon: <AlertCircle size={18} className="text-rose-500" />,
            label: 'PENDENTE',
            dot: 'bg-rose-400'
        };
    };

    // Calculate overall status and days
    const isFullyLiberated =
        getStatusStyle(collaborator.rh).label === 'CONCLUÍDO' &&
        getStatusStyle(collaborator.saude).label === 'CONCLUÍDO' &&
        getStatusStyle(collaborator.seguranca).label === 'CONCLUÍDO' &&
        getStatusStyle(collaborator.grd).label === 'CONCLUÍDO';



    // Calculate Business Days (simplified)
    // Calculate Business Days (excluding weekends)
    const calculateDays = () => {
        if (!collaborator.admissionDate) return '-';
        let current = dayjs(collaborator.admissionDate);
        const end = collaborator.liberationDate ? dayjs(collaborator.liberationDate) : dayjs();

        let businessDays = 0;
        // Loop: Check start day -> add 1 -> check if still before or same
        // Note: isBefore is strictly before. 
        // Logic: Iterate day by day.

        // While current <= end (inclusive of end date usually for total time span?)
        // If I use diff, it's exclusive of end if not full 24h?
        // Let's use isBefore(end, 'day') to imply < diff.
        // If start = end, 0 days.

        while (current.isBefore(end, 'day')) {
            const day = current.day();
            if (day !== 0 && day !== 6) businessDays++;
            current = current.add(1, 'day');
        }
        return Math.max(0, businessDays);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                    >
                        {/* Modal Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors z-10"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>

                            <div className="p-8 pb-6">
                                {/* Header Section */}
                                <div className="flex items-center gap-5 mb-10">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg shrink-0 ${isFullyLiberated ? 'bg-slate-700' : 'bg-rose-500'}`}>
                                        <Shield size={32} className="text-white" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">
                                            {collaborator.name}
                                        </h2>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                                            {collaborator.role}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-300 bg-slate-50 inline-block px-1.5 py-0.5 rounded leading-none">
                                            ID: {collaborator.chapa}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {/* RH */}
                                    <StatusCard
                                        title="RH"
                                        subtitle="Documentação"
                                        status={collaborator.rh}
                                        icon={<FileText size={16} />}
                                    />
                                    {/* SAÚDE */}
                                    <StatusCard
                                        title="SAÚDE"
                                        subtitle="Exame ASO"
                                        status={collaborator.saude}
                                        icon={<HeartPulse size={16} />}
                                    />
                                    {/* SEGURANÇA */}
                                    <StatusCard
                                        title="SEGURANÇA"
                                        subtitle="Treinamento"
                                        status={collaborator.seguranca}
                                        icon={<HardHat size={16} />}
                                    />
                                    {/* GRD */}
                                    <StatusCard
                                        title="GRD"
                                        subtitle="Liberação Final"
                                        status={collaborator.grd}
                                        icon={<FileCheck size={16} />}
                                    />
                                </div>

                                {/* Dates Footer */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Admissão</p>
                                        <p className="text-lg font-black text-slate-700">
                                            {collaborator.admissionDate ? dayjs(collaborator.admissionDate).format('DD/MM/YYYY') : '-'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Liberação E-coordina</p>
                                        <p className="text-lg font-black text-slate-700">
                                            {collaborator.liberationDate ? dayjs(collaborator.liberationDate).format('DD/MM/YYYY') : 'Pendente'}
                                        </p>
                                    </div>
                                </div>

                                {/* Total Time Card */}
                                <div className={`w-full rounded-[2rem] p-6 border ${isFullyLiberated ? 'bg-slate-50 border-slate-100' : 'bg-rose-50/30 border-rose-100'}`}>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Tempo Total de Liberação <span className="font-medium text-[9px] text-slate-400 normal-case ml-1">(Não Conta Sábado e Domingo)</span>
                                    </p>
                                    <p className={`text-3xl font-black ${isFullyLiberated ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {calculateDays()} Dias Úteis
                                    </p>
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const StatusCard = ({ title, subtitle, status, icon }: { title: string, subtitle: string, status?: string, icon: React.ReactNode }) => {
    // Determine style based on status
    const isOk = status?.trim().toUpperCase() === 'OK' || status?.trim().toUpperCase() === 'CONCLUIDO';

    // Configs


    // Refined logic to match images exactly:
    // PENDENTE -> Red Label
    // CONCLUÍDO -> Dark Label (slate-800)

    const labelText = isOk ? 'CONCLUÍDO' : 'PENDENTE';
    const labelClass = isOk ? 'text-slate-800' : 'text-rose-500';

    // Icon Colors per Type to match image 1 's beautiful multi-color icons
    // RH -> Purple, Saúde -> Orange, Segurança -> Green, GRD -> Cyan
    let iconBgClass = 'bg-slate-100 text-slate-400';
    if (isOk) {
        if (title === 'RH') iconBgClass = 'bg-indigo-100 text-indigo-600';
        else if (title === 'SAÚDE') iconBgClass = 'bg-orange-100 text-orange-600';
        else if (title === 'SEGURANÇA') iconBgClass = 'bg-emerald-100 text-emerald-600';
        else if (title === 'GRD') iconBgClass = 'bg-cyan-100 text-cyan-600';
    }

    return (
        <div className="bg-slate-50/50 border border-slate-100 rounded-[20px] p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <p className={`text-sm font-black ${labelClass} leading-tight`}>{labelText}</p>
                <p className="text-[10px] font-medium text-slate-400">{subtitle}</p>
            </div>
        </div>
    );
};

export default CollaboratorModal;
