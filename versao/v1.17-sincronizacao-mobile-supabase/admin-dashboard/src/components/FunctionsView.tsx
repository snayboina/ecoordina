import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';
import type { Collaborator } from '../types';
import dayjs from 'dayjs';
import CollaboratorModal from './CollaboratorModal';

interface FunctionsViewProps {
    collaborators: Collaborator[];
    selectedRole: string | null;
    onRoleSelect: (role: string | null) => void;
    startDate: string;
    endDate: string;
    onSpreadsheetOpen: () => void;
    onClearAll: () => void;
}

interface RoleStats {
    role: string;
    total: number;
    liberated: number;
    pending: number;
    collaborators: Collaborator[];
}

const getEffectiveStatus = (c: Collaborator) => {
    return c.status;
};

const FunctionsView: React.FC<FunctionsViewProps> = ({
    collaborators,
    selectedRole,
    onRoleSelect,
    startDate,
    endDate,
    onSpreadsheetOpen,
    onClearAll
}) => {
    const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter collaborators by Date Range
    const dateFilteredCollaborators = useMemo(() => {
        return collaborators.filter(c => {
            if (!startDate && !endDate) return true;
            const admission = c.admissionDate ? dayjs(c.admissionDate) : null;
            const start = startDate ? dayjs(startDate) : null;
            const end = endDate ? dayjs(endDate) : null;

            if (!admission) return false;
            if (start && admission.isBefore(start, 'day')) return false;
            if (end && admission.isAfter(end, 'day')) return false;
            return true;
        });
    }, [collaborators, startDate, endDate]);

    // Aggregate data by Role
    const rolesData = useMemo(() => {
        const groups: Record<string, RoleStats> = {};

        dateFilteredCollaborators.forEach(c => {
            const role = c.role.trim() || 'Sem Função';
            if (!groups[role]) {
                groups[role] = {
                    role,
                    total: 0,
                    liberated: 0,
                    pending: 0,
                    collaborators: []
                };
            }

            const status = getEffectiveStatus(c);
            groups[role].total++;
            if (status === 'LIBERADO') groups[role].liberated++;
            else groups[role].pending++;

            groups[role].collaborators.push(c);
        });

        return Object.values(groups).sort((a, b) => a.role.localeCompare(b.role));
    }, [dateFilteredCollaborators]);

    // Filter roles based on search
    const filteredRoles = useMemo(() => {
        return rolesData.filter(r => r.role.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [rolesData, searchTerm]);

    // Set default selected role
    useMemo(() => {
        if (!selectedRole && filteredRoles.length > 0) {
            onRoleSelect(filteredRoles[0].role);
        }
    }, [filteredRoles, selectedRole, onRoleSelect]);

    const activeRoleData = rolesData.find(r => r.role === selectedRole);

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6 overflow-hidden p-4 md:p-8 pt-4">
            {/* Sidebar */}
            <div className="w-full lg:w-[460px] shrink-0 flex flex-col gap-4 overflow-hidden">
                <div className="flex flex-col gap-4 bg-white p-5 rounded-3xl shadow-md border border-slate-100 shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 leading-none">Filtros</h2>
                            <span className="text-xs font-bold text-slate-400">Filtros</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-2">
                        <Search className="text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar função..."
                            className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                            onClick={onSpreadsheetOpen}
                            disabled={!selectedRole}
                            className={`text-[10px] font-black flex items-center justify-center gap-2 uppercase tracking-widest transition-all px-4 py-3 rounded-2xl border ${!selectedRole
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary hover:text-white shadow-sm'
                                }`}
                        >
                            <span className="shrink-0 leading-none">Visualizar</span>
                        </button>

                        <button
                            onClick={onClearAll}
                            className="text-[10px] font-black text-rose-500 hover:text-white hover:bg-rose-500 flex items-center justify-center gap-2 uppercase tracking-widest transition-all bg-rose-50 px-4 py-3 rounded-2xl border border-rose-100 shadow-sm"
                        >
                            <span className="shrink-0 leading-none">Limpar</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 pb-4">
                        {filteredRoles.map(item => {
                            const isSelected = selectedRole === item.role;
                            const percent = Math.round((item.liberated / item.total) * 100) || 0;

                            return (
                                <motion.button
                                    key={item.role}
                                    layoutId={item.role}
                                    onClick={() => onRoleSelect(item.role)}
                                    className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${isSelected
                                        ? 'bg-slate-900 border-slate-800 shadow-lg scale-[1.02] z-10'
                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <h3 className={`font-black text-xs pr-2 leading-tight line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                            {item.role}
                                        </h3>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {item.total}
                                        </span>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between text-[9px] uppercase font-black tracking-widest mb-1.5 opacity-90">
                                            <span className="text-slate-400">Progresso</span>
                                            <span className={isSelected ? 'text-emerald-400' : 'text-slate-600'}>{percent}%</span>
                                        </div>
                                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isSelected ? 'bg-white/10' : 'bg-slate-100'}`}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-brand-primary'}`}
                                            />
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <motion.div
                                            layoutId="selection-border"
                                            className="absolute inset-0 border-2 border-emerald-500/50 rounded-2xl pointer-events-none"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Panel */}
            <div className="flex-1 bg-slate-50/50 rounded-3xl border border-slate-200/60 p-6 flex flex-col overflow-hidden relative shadow-inner">
                {activeRoleData ? (
                    <>
                        {/* Header removido - Informação movida para o cabeçalho fixo principal */}


                        {/* Bottleneck logic */}
                        {(() => {
                            const collabs = activeRoleData.collaborators;
                            const calcAvg = (finishField: keyof Collaborator) => {
                                const valid = collabs.filter(c => c.admissionDate && c[finishField]);
                                if (valid.length === 0) return 0;
                                const total = valid.reduce((acc, curr) => {
                                    let current = dayjs(curr.admissionDate);
                                    const end = dayjs(curr[finishField] as string);
                                    let days = 0;
                                    while (current.isBefore(end, 'day')) {
                                        const d = current.day();
                                        if (d !== 0 && d !== 6) days++;
                                        current = current.add(1, 'day');
                                    }
                                    return acc + days;
                                }, 0);
                                return Math.round(total / valid.length);
                            };

                            const statsList = [
                                { label: 'RH', avg: calcAvg('rhFinishedAt'), color: 'text-indigo-500' },
                                { label: 'Saúde', avg: calcAvg('saudeFinishedAt'), color: 'text-orange-500' },
                                { label: 'Seguridade', avg: calcAvg('segurancaFinishedAt'), color: 'text-emerald-500' }
                            ].filter(s => s.avg > 0);

                            if (statsList.length === 0) return null;

                            const maxAvg = Math.max(...statsList.map(s => s.avg));
                            const bottleneck = statsList.find(s => s.avg === maxAvg);

                            return (
                                <div className="flex gap-2 items-center mb-4">
                                    <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded animate-pulse">
                                        GARGALO: {bottleneck?.label} ({bottleneck?.avg}d)
                                    </span>
                                    <div className="flex gap-2 border-l border-slate-200 pl-2">
                                        {statsList.map(s => (
                                            <span key={s.label} className={`text-[9px] font-bold ${s.color}`}>
                                                {s.label}: {s.avg}d
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden min-h-0">
                            {/* PENDENTE Column */}
                            <div className="flex flex-col h-full overflow-hidden bg-white border border-rose-100 rounded-2xl shadow-sm">
                                <div className="p-3 border-b border-rose-100 bg-rose-100/30 flex justify-between items-center shrink-0 sticky top-0 z-20 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 rounded-full bg-rose-500" />
                                        <span className="font-black text-rose-900 uppercase tracking-widest text-[10px]">Pendente</span>
                                    </div>
                                    <span className="bg-white text-rose-600 px-2 py-0.5 rounded-md text-[10px] font-black border border-rose-100">
                                        {activeRoleData.pending}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-rose-50/10">
                                    {activeRoleData.collaborators
                                        .filter(c => getEffectiveStatus(c) !== 'LIBERADO')
                                        .map(c => (
                                            <KanbanCard
                                                key={c.chapa}
                                                collaborator={c}
                                                status="PENDENTE"
                                                onClick={() => setSelectedCollaborator(c)}
                                            />
                                        ))}
                                </div>
                            </div>

                            {/* LIBERADO Column */}
                            <div className="flex flex-col h-full overflow-hidden bg-white border border-emerald-100 rounded-2xl shadow-sm">
                                <div className="p-3 border-b border-emerald-100 bg-emerald-100/30 flex justify-between items-center shrink-0 sticky top-0 z-20 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
                                        <span className="font-black text-emerald-900 uppercase tracking-widest text-[10px]">Liberado</span>
                                    </div>
                                    <span className="bg-white text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-black border border-emerald-100">
                                        {activeRoleData.liberated}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-emerald-50/10">
                                    {activeRoleData.collaborators
                                        .filter(c => getEffectiveStatus(c) === 'LIBERADO')
                                        .map(c => (
                                            <KanbanCard
                                                key={c.chapa}
                                                collaborator={c}
                                                status="LIBERADO"
                                                onClick={() => setSelectedCollaborator(c)}
                                            />
                                        ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p className="font-bold text-sm">Selecione uma função para ver o quadro</p>
                    </div>
                )}
            </div>

            {selectedCollaborator && (
                <CollaboratorModal
                    isOpen={!!selectedCollaborator}
                    onClose={() => setSelectedCollaborator(null)}
                    collaborator={selectedCollaborator}
                />
            )}
        </div>
    );
};

const KanbanCard: React.FC<{
    collaborator: Collaborator;
    status: 'LIBERADO' | 'PENDENTE';
    onClick: () => void;
}> = ({ collaborator, status, onClick }) => {
    return (
        <motion.div
            layoutId={collaborator.chapa}
            onClick={onClick}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-slate-400">#{collaborator.chapa}</span>
                <div className={`w-2 h-2 rounded-full ${status === 'LIBERADO' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
            <h4 className="font-black text-slate-800 text-[11px] leading-tight mb-2 group-hover:text-brand-primary transition-colors">
                {collaborator.name}
            </h4>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 opacity-60">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admissão:</span>
                    <span className="text-[9px] font-black text-slate-600">
                        {collaborator.admissionDate ? dayjs(collaborator.admissionDate).format('DD/MM/YYYY') : '-'}
                    </span>
                </div>
                {status === 'LIBERADO' && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Liberado:</span>
                        <span className="text-[9px] font-black text-emerald-700">
                            {collaborator.liberationDate ? dayjs(collaborator.liberationDate).format('DD/MM/YYYY') : '-'}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default FunctionsView;
