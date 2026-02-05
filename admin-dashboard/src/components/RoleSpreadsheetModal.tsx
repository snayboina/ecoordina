import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle2, FileDown, FileSpreadsheet } from 'lucide-react';
import type { Collaborator } from '../types';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RoleSpreadsheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    roleName: string;
    collaborators: Collaborator[];
}

const RoleSpreadsheetModal: React.FC<RoleSpreadsheetModalProps> = ({ isOpen, onClose, roleName, collaborators }) => {
    const getEffectiveStatus = (c: Collaborator) => {
        if (c.grd && c.grd.trim().toUpperCase() === 'OK') return 'LIBERADO';
        return c.status;
    };

    const sortedCollabs = [...collaborators].sort((a, b) => {
        const statusA = getEffectiveStatus(a);
        const statusB = getEffectiveStatus(b);
        if (statusA === statusB) return a.name.localeCompare(b.name);
        return statusA === 'PENDENTE' ? -1 : 1;
    });

    const handleExportExcel = () => {
        const data = sortedCollabs.map(c => ({
            'CHAPA': c.chapa,
            'NOME': c.name,
            'ADMISSÃO': c.admissionDate ? dayjs(c.admissionDate).format('DD/MM/YYYY') : '-',
            'STATUS': getEffectiveStatus(c),
            'RH': c.rh || '-',
            'SAÚDE': c.saude || '-',
            'SEGURIDADE': c.seguranca || '-',
            'GRD': c.grd || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores');
        XLSX.writeFile(wb, `Ecoordina_${roleName.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Relatório de Função: ${roleName}`, 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 28);
        doc.text(`Total de Colaboradores: ${collaborators.length}`, 14, 34);

        const tableData = sortedCollabs.map(c => [
            c.chapa,
            c.name,
            c.admissionDate ? dayjs(c.admissionDate).format('DD/MM/YYYY') : '-',
            getEffectiveStatus(c),
            c.rh || '-',
            c.saude || '-',
            c.seguranca || '-',
            c.grd || '-'
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Chapa', 'Nome', 'Admissão', 'Status', 'RH', 'Saúde', 'Seguridade', 'GRD']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 8, cellPadding: 3 }
        });

        doc.save(`Ecoordina_${roleName.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD')}.pdf`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl text-white">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                                        {roleName}
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Visualização em Planilha • {collaborators.length} Total
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleExportExcel}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black transition-all border border-emerald-500/20"
                                >
                                    <FileSpreadsheet size={14} />
                                    EXCEL
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[10px] font-black transition-all border border-rose-500/20"
                                >
                                    <FileDown size={14} />
                                    PDF
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white ml-2"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className="sticky top-0 bg-slate-900 z-20 pb-4 pt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800">Chapa</th>
                                        <th className="sticky top-0 bg-slate-900 z-20 pb-4 pt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800">Nome</th>
                                        <th className="sticky top-0 bg-slate-900 z-20 pb-4 pt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 text-center">Admissão</th>
                                        <th className="sticky top-0 bg-slate-900 z-20 pb-4 pt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 text-center">Status</th>
                                        <th className="sticky top-0 bg-slate-900 z-20 pb-4 pt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 text-center">RH</th>
                                        <th className="sticky top-0 bg-slate-900 z-20 pb-4 pt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 text-center">Saúde</th>
                                        <th className="sticky top-0 bg-slate-900 z-20 pb-4 pt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 text-center">Seguridade</th>
                                        <th className="sticky top-0 bg-slate-900 z-20 pb-4 pt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 text-center">GRD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCollabs.map((c, idx) => {
                                        const status = getEffectiveStatus(c);
                                        const isEven = idx % 2 === 0;

                                        const StepIndicator = ({ val }: { val: string | undefined }) => (
                                            <div className="flex justify-center">
                                                {val === 'OK' ? (
                                                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100/50">
                                                        <CheckCircle2 size={14} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-400 flex items-center justify-center border border-rose-100/50 opacity-40">
                                                        <X size={12} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        );

                                        return (
                                            <tr key={c.chapa} className={`${isEven ? 'bg-slate-50/30' : 'bg-transparent'} hover:bg-brand-primary/5 transition-colors group`}>
                                                <td className="py-3 px-4 text-xs font-black text-slate-400 border border-slate-100">#{c.chapa}</td>
                                                <td className="py-3 px-4 text-xs font-black text-slate-700 border border-slate-100 group-hover:text-brand-primary transition-colors">{c.name}</td>
                                                <td className="py-3 px-4 text-xs font-bold text-slate-500 text-center border border-slate-100">
                                                    {c.admissionDate ? dayjs(c.admissionDate).format('DD/MM/YYYY') : '-'}
                                                </td>
                                                <td className="py-3 px-4 border border-slate-100">
                                                    <div className="flex justify-center">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${status === 'LIBERADO'
                                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                            : 'bg-rose-50 border-rose-100 text-rose-600'
                                                            }`}>
                                                            {status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 border border-slate-100"><StepIndicator val={c.rh} /></td>
                                                <td className="py-3 px-4 border border-slate-100"><StepIndicator val={c.saude} /></td>
                                                <td className="py-3 px-4 border border-slate-100"><StepIndicator val={c.seguranca} /></td>
                                                <td className="py-3 px-4 border border-slate-100"><StepIndicator val={c.grd} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RoleSpreadsheetModal;
