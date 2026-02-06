import React, { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Clock,
    Search as SearchIcon,
    LogOut,
    TrendingUp,
    Zap,
    X,
    CheckCircle2,
    Download,
    Columns as KanbanIcon,
    Calendar
} from 'lucide-react';
// import WelcomeHero from './components/WelcomeHero';
import FunctionsView from './components/FunctionsView';
import RoleSpreadsheetModal from './components/RoleSpreadsheetModal';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCollaborators, subscribeToSyncLogs, calculateBusinessDays } from './services/api';
import type { Collaborator } from './types';
import Login from './Login';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList
} from 'recharts';

const getEffectiveStatus = (c: Collaborator) => {
    if (c.grd && c.grd.trim().toUpperCase() === 'OK') return 'LIBERADO';
    return c.status;
};

const SECTOR_COLORS: Record<string, { bg: string, text: string, border: string }> = {
    'RH': { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    'SAÚDE': { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
    'SEGURANÇA': { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
    'GRD': { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200' },
    'PENDENTE': { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200' }
};

const getStepStyles = (sector: string, status?: string) => {
    if (status === 'OK') {
        const key = sector.toUpperCase();
        return SECTOR_COLORS[key] || SECTOR_COLORS['GRD'];
    }
    return SECTOR_COLORS['PENDENTE'];
};

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ name: string; role?: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'liberation' | 'kanban' | 'functions'>('overview');
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [search, setSearch] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'TODOS' | 'LIBERADO' | 'PENDENTE'>('TODOS');
    const [showPreview, setShowPreview] = useState(false);
    const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [startDate, setStartDate] = useState('2026-01-01');
    const [endDate, setEndDate] = useState('2026-02-28');
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);

    const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutos em ms

    const handleLogin = (email: string, password: string, userData?: { name: string; role?: string }) => {
        if (email && password) {
            setIsAuthenticated(true);
            if (userData) {
                setCurrentUser(userData);
                // Salva a sessão
                localStorage.setItem('ecoordina_session', JSON.stringify({
                    userData,
                    timestamp: Date.now()
                }));
            }
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('ecoordina_session');
    };

    useEffect(() => {
        // Recuperar sessão
        const session = localStorage.getItem('ecoordina_session');
        if (session) {
            const { userData, timestamp } = JSON.parse(session);
            const now = Date.now();
            if (now - timestamp < SESSION_TIMEOUT) {
                setIsAuthenticated(true);
                setCurrentUser(userData);
                // Atualiza o timestamp para renovar os 10 min a cada carregamento/atividade
                localStorage.setItem('ecoordina_session', JSON.stringify({
                    userData,
                    timestamp: now
                }));
            } else {
                localStorage.removeItem('ecoordina_session');
            }
        }

        const loadData = async () => {
            try {
                const collabs = await fetchCollaborators();
                setCollaborators(collabs);

                // Pega a data de atualização mais recente dos dados (api já retorna ordenado desc)
                if (collabs.length > 0 && collabs[0].updatedAt) {
                    setLastUpdate(dayjs(collabs[0].updatedAt).toDate());
                }
            } catch (error) {
                console.error("Error fetching collaborators:", error);
            }
        };
        loadData();

        const subscription = subscribeToSyncLogs(() => {
            loadData();
        });

        return () => { subscription.unsubscribe(); };
    }, []);

    const uniqueRoles = useMemo(() => {
        const roles = Array.from(new Set(collaborators.map(c => c.role.trim()).filter(Boolean)));
        return roles.sort();
    }, [collaborators]);

    const filteredCollabs = useMemo(() => {
        return collaborators
            .filter(c => {
                const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.chapa.includes(search);
                const matchesName = c.name.toLowerCase().includes(nameFilter.toLowerCase());
                const matchesRole = roleFilter === '' || c.role.trim() === roleFilter;
                const matchesStatus = statusFilter === 'TODOS' || getEffectiveStatus(c) === statusFilter;

                // Filtro de Data
                let matchesDate = true;
                if (c.admissionDate) {
                    const date = dayjs(c.admissionDate, ['YYYY-MM-DD', 'DD/MM/YYYY', 'D/M/YYYY']);
                    const isoDate = date.isValid() ? date.format('YYYY-MM-DD') : null;
                    if (isoDate) {
                        const start = startDate || '0000-00-00';
                        const end = endDate || '9999-99-99';
                        matchesDate = isoDate >= start && isoDate <= end;
                    }
                }

                return matchesSearch && matchesName && matchesRole && matchesStatus && matchesDate;
            })
            .sort((a, b) => {
                const getTimestamp = (d?: string) => {
                    if (!d) return 0;
                    // Use dayjs with strict parsing for consistency, fallback to 0
                    const date = dayjs(d, ['YYYY-MM-DD', 'DD/MM/YYYY', 'D/M/YYYY']);
                    return date.isValid() ? date.valueOf() : 0;
                };
                // Sort descending (most recent first)
                return getTimestamp(b.admissionDate) - getTimestamp(a.admissionDate);
            });
    }, [collaborators, search, nameFilter, roleFilter, statusFilter, startDate, endDate]);

    const stats = useMemo(() => {
        const total = filteredCollabs.length;
        const liberated = filteredCollabs.filter(c => getEffectiveStatus(c) === 'LIBERADO').length;
        const pending = total - liberated;
        const percentLiberated = total > 0 ? Math.round((liberated / total) * 100) : 0;
        return { total, liberated, pending, percentLiberated };
    }, [filteredCollabs]);

    const activeRoleStats = useMemo(() => {
        if (!selectedRole) return null;
        const roleCollabs = filteredCollabs.filter(c => c.role.trim() === selectedRole);
        const total = roleCollabs.length;
        const liberated = roleCollabs.filter(c => getEffectiveStatus(c) === 'LIBERADO').length;
        const pending = total - liberated;

        const liberatedCollabsForLeadTime = roleCollabs.filter(c => getEffectiveStatus(c) === 'LIBERADO');
        let leadTimeAvg = 0;
        if (liberatedCollabsForLeadTime.length > 0) {
            const totalDays = liberatedCollabsForLeadTime.reduce((acc, curr) => acc + calculateBusinessDays(curr.admissionDate, curr.liberationDate), 0);
            leadTimeAvg = Math.round(totalDays / liberatedCollabsForLeadTime.length);
        }

        return { role: selectedRole, total, liberated, pending, leadTimeAvg };
    }, [filteredCollabs, selectedRole]);


    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Liberação');
        worksheet.columns = [
            { header: 'ID', key: 'chapa', width: 15 },
            { header: 'Colaborador', key: 'name', width: 35 },
            { header: 'Função', key: 'role', width: 25 },
            { header: 'Admissão', key: 'admissionDate', width: 15 },
            { header: 'Liberação', key: 'liberationDate', width: 15 },
            { header: 'Dias Úteis', key: 'days', width: 12 },
            { header: 'RH', key: 'rh', width: 10 },
            { header: 'Saúde', key: 'saude', width: 10 },
            { header: 'Segurança', key: 'seguranca', width: 15 },
            { header: 'GRD', key: 'grd', width: 10 },
            { header: 'Status Final', key: 'effectiveStatus', width: 15 }
        ];

        // Header Styling
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF47536f' } // Fiord
        };

        filteredCollabs.forEach(c => {
            worksheet.addRow({
                ...c,
                admissionDate: c.admissionDate ? dayjs(c.admissionDate).format('DD/MM/YYYY') : '-',
                liberationDate: c.liberationDate ? dayjs(c.liberationDate).format('DD/MM/YYYY') : '-',
                days: calculateBusinessDays(c.admissionDate, c.liberationDate),
                effectiveStatus: getEffectiveStatus(c)
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `liberacao_${dayjs().format('YYYYMMDD')}.xlsx`;
        link.click();
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape') as any;
        const tableColumn = ["ID", "Colaborador", "Função", "Admissão", "Liberação", "Dias", "RH", "SAU", "SEG", "GRD", "Status"];
        const tableRows: any[] = [];

        filteredCollabs.forEach(c => {
            const rowData = [
                c.chapa,
                c.name,
                c.role,
                c.admissionDate ? dayjs(c.admissionDate).format('DD/MM/YYYY') : '-',
                c.liberationDate ? dayjs(c.liberationDate).format('DD/MM/YYYY') : '-',
                calculateBusinessDays(c.admissionDate, c.liberationDate),
                c.rh,
                c.saude,
                c.seguranca,
                c.grd,
                getEffectiveStatus(c)
            ];
            tableRows.push(rowData);
        });

        doc.setFontSize(18);
        doc.text("Relatório de Liberação - Ecoordina Smart", 14, 15);
        doc.setFontSize(10);
        doc.text(`Data: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 22);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [71, 83, 111], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 3 },
            alternateRowStyles: { fillColor: [245, 245, 244] } // Warm gray tint
        });

        doc.save(`liberacao_${dayjs().format('YYYYMMDD')}.pdf`);
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen w-screen bg-saas-bg overflow-hidden font-sans selection:bg-brand-primary/10">
            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-saas-sidebar flex flex-col relative z-20 shrink-0">
                <div className="p-8 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-secondary rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Zap className="text-white" size={20} fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black tracking-widest text-lg leading-none">ECOORDINA</span>
                            <span className="text-brand-secondary text-[10px] font-bold tracking-[0.3em]">SMART</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`saas-sidebar-item w-full ${activeTab === 'overview' ? 'active' : ''}`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-semibold text-sm">Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('liberation')}
                        className={`saas-sidebar-item w-full ${activeTab === 'liberation' ? 'active' : ''}`}
                    >
                        <ShieldCheck size={20} />
                        <span className="font-semibold text-sm">Liberação</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('functions')}
                        className={`saas-sidebar-item w-full ${activeTab === 'functions' ? 'active' : ''}`}
                    >
                        <Users size={20} />
                        <span className="font-semibold text-sm">Funções</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('kanban')}
                        className={`saas-sidebar-item w-full ${activeTab === 'kanban' ? 'active' : ''}`}
                    >
                        <KanbanIcon size={20} />
                        <span className="font-semibold text-sm">Desenvolvedor</span>
                    </button>

                    <div className="pt-8 px-4">
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Suporte & Logs</span>
                    </div>
                    <button className="saas-sidebar-item w-full opacity-50 cursor-not-allowed">
                        <Clock size={20} />
                        <span className="font-semibold text-sm">Histórico</span>
                    </button>
                </nav>

                <div className="p-6">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-red-300 hover:bg-red-500/10 transition-all font-bold text-sm">
                        <LogOut size={18} />
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/50 backdrop-blur-md border-b border-saas-border flex items-center justify-between px-10 shrink-0">
                    {/* Informações no lado esquerdo */}
                    {lastUpdate && (
                        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-inner">
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                        {(selectedRole && activeTab === 'functions') ? 'Função' : 'Atualizado'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`${(selectedRole && activeTab === 'functions') ? 'text-xl' : 'text-sm'} font-black text-slate-700 leading-none tracking-tight`}>
                                        {(selectedRole && activeTab === 'functions') ? selectedRole : dayjs(lastUpdate).format('DD/MM/YYYY')}
                                    </span>
                                </div>
                            </div>

                            {!(selectedRole && activeTab === 'functions') && (
                                <>
                                    <div className="w-px h-8 bg-slate-200" />

                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Liberados</span>
                                            <span className="text-xs font-black text-brand-primary">{stats.liberated}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pendentes</span>
                                            <span className="text-xs font-black text-rose-500">{stats.pending}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex-1" />

                    {activeTab === 'functions' && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100 shadow-inner flex-nowrap">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Início</span>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 uppercase p-0 h-3 cursor-pointer"
                                        />
                                    </div>
                                    <div className="w-px h-6 bg-slate-200 mx-1" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fim</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 uppercase p-0 h-3 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Profile */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-200 h-8">
                            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full py-1.5 px-2 pr-5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-black text-xs group-hover:bg-slate-200 transition-colors">
                                    {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'AD'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800 leading-none mb-0.5">{currentUser?.name || 'Admin Ecoordina'}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{currentUser?.role || 'USUÁRIO'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className={`flex-1 ${activeTab === 'functions' ? 'overflow-hidden' : 'overflow-auto'} custom-scrollbar`}>
                    <div className={`${activeTab === 'functions' ? 'h-full flex flex-col' : 'max-w-7xl mx-auto space-y-10 px-10 pt-2 pb-10'}`}>
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-10"
                                >
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <div className="flex items-baseline gap-4 mb-2">
                                                <h1 className="text-5xl font-black tracking-tighter text-slate-900">Visão Geral</h1>
                                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                                    Janeiro 2026 e Fevereiro 2026
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-text-muted font-medium text-lg">Apresentação executiva do status de liberação da equipe.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metric Header */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="saas-card bg-slate-50 border-slate-200 text-slate-900 shadow-xl transform transition-all hover:-translate-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Total</p>
                                            <div className="flex items-end justify-between">
                                                <h3 className="text-5xl font-black text-slate-900">{stats.total}</h3>
                                                <div className="w-10 h-10 bg-slate-900/5 rounded-xl flex items-center justify-center">
                                                    <Users size={20} className="text-slate-900" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="saas-card bg-slate-50 border-slate-200 text-slate-900 shadow-xl transform transition-all hover:-translate-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Liberados</p>
                                            <div className="flex items-end justify-between">
                                                <h3 className="text-5xl font-black" style={{ color: '#47536f' }}>{stats.liberated}</h3>
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(71, 83, 111, 0.1)' }}>
                                                    <ShieldCheck size={20} style={{ color: '#47536f' }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="saas-card bg-rose-50 border-rose-100 text-rose-900 shadow-xl transform transition-all hover:-translate-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400 mb-4">Pendentes</p>
                                            <div className="flex items-end justify-between">
                                                <h3 className="text-5xl font-black" style={{ color: '#b05d75' }}>{stats.pending}</h3>
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(176, 93, 117, 0.1)' }}>
                                                    <Clock size={20} style={{ color: '#b05d75' }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="saas-card bg-violet-50 border-violet-100 text-violet-900 shadow-xl transform transition-all hover:-translate-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400 mb-4">Eficiência</p>
                                            <div className="flex items-end justify-between">
                                                <h3 className="text-5xl font-black" style={{ color: '#aaa0c0' }}>{stats.percentLiberated}%</h3>
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(170, 160, 192, 0.1)' }}>
                                                    <TrendingUp size={20} style={{ color: '#aaa0c0' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Presentation Section - Charts */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[450px]">
                                        {/* Status Distribution - Pie Chart */}
                                        <div className="saas-card flex flex-col items-center justify-center relative overflow-hidden group">
                                            <div className="absolute top-8 left-8">
                                                <h3 className="text-xl font-black text-slate-900">Distribuição de Status</h3>
                                                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Visão Proporcional</p>
                                            </div>
                                            <div className="w-full h-full pt-16">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={[
                                                                { name: 'Liberados', value: stats.liberated },
                                                                { name: 'Pendentes', value: stats.pending }
                                                            ]}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={80}
                                                            outerRadius={130}
                                                            paddingAngle={8}
                                                            dataKey="value"
                                                            stroke="none"
                                                            label={({ name, value }) => `${name}: ${value}`}
                                                        >
                                                            <Cell fill="#47536f" />
                                                            <Cell fill="#b05d75" />
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            {/* Central Overlay */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-12">
                                                <span className="text-4xl font-black leading-none" style={{ color: '#47536f' }}>{stats.percentLiberated}%</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Liberados</span>
                                            </div>
                                        </div>

                                        {/* Performance Matrix - Bar Chart */}
                                        <div className="saas-card relative overflow-hidden">
                                            <div className="absolute top-8 left-8">
                                                <h3 className="text-xl font-black text-slate-900">Matriz de Eficiência</h3>
                                                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Comparativo Real</p>
                                            </div>
                                            <div className="w-full h-full pt-20 px-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={[
                                                        { name: 'Total', value: stats.total },
                                                        { name: 'Liberados', value: stats.liberated },
                                                        { name: 'Pendentes', value: stats.pending }
                                                    ]}
                                                        margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                        <XAxis
                                                            dataKey="name"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 10, fontWeight: '800', fill: '#94A3B8' }}
                                                        />
                                                        <YAxis hide />
                                                        <Tooltip
                                                            cursor={{ fill: '#F1F5F9' }}
                                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                                        />
                                                        <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={60}>
                                                            <Cell fill="#aaa0c0" />
                                                            <Cell fill="#47536f" />
                                                            <Cell fill="#b05d75" />
                                                            <LabelList dataKey="value" position="top" style={{ fill: '#64748b', fontSize: 12, fontWeight: 900 }} />
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'liberation' && (
                                <motion.div
                                    key="liberation"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8 pb-20"
                                >
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                        <div>
                                            <h1 className="text-4xl font-black tracking-tight text-slate-900">Liberação de Equipe</h1>
                                            <div className="mt-1">
                                                <p className="text-text-muted font-medium">Dados de: Janeiro 2026 e Fevereiro 2026</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex bg-white rounded-xl shadow-sm border border-saas-border p-1">
                                                <button
                                                    onClick={handleExportExcel}
                                                    className="px-4 py-2 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-black transition-all flex items-center gap-2 border border-transparent hover:border-slate-200"
                                                >
                                                    <Download size={14} />
                                                    EXCEL
                                                </button>
                                                <div className="w-px bg-slate-100 my-1 mx-1" />
                                                <button
                                                    onClick={() => setShowPreview(true)}
                                                    className="px-4 py-2 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-black transition-all flex items-center gap-2 border border-transparent hover:border-slate-100"
                                                >
                                                    <SearchIcon size={14} />
                                                    VISUALIZAR
                                                </button>
                                                <div className="w-px bg-slate-100 my-1 mx-1" />
                                                <button
                                                    onClick={handleExportPDF}
                                                    className="px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg text-xs font-black transition-all flex items-center gap-2 border border-transparent hover:border-red-100"
                                                >
                                                    <Download size={14} />
                                                    PDF
                                                </button>
                                            </div>
                                            <button className="saas-btn-primary" onClick={() => {
                                                setSearch('');
                                                setNameFilter('');
                                                setRoleFilter('');
                                                setStatusFilter('TODOS');
                                                setStartDate('2026-01-01');
                                                setEndDate('2026-02-28');
                                            }}>
                                                <X size={16} />
                                                Limpar Filtros
                                            </button>
                                        </div>
                                    </div>

                                    {/* Advanced Filters */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                                        <div className="saas-card p-4 flex items-center gap-3">
                                            <SearchIcon className="text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Filtrar por Nome..."
                                                className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700"
                                                value={nameFilter}
                                                onChange={(e) => setNameFilter(e.target.value)}
                                            />
                                        </div>
                                        <div className="saas-card p-4 flex items-center gap-3">
                                            <Users className="text-slate-400" size={18} />
                                            <select
                                                className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700 cursor-pointer appearance-none"
                                                value={roleFilter}
                                                onChange={(e) => setRoleFilter(e.target.value)}
                                            >
                                                <option value="">Função</option>
                                                {uniqueRoles.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="saas-card p-4 flex items-center gap-3">
                                            <ShieldCheck className="text-slate-400" size={18} />
                                            <select
                                                className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700 cursor-pointer appearance-none"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                            >
                                                <option value="TODOS">Status</option>
                                                <option value="LIBERADO">Liberado</option>
                                                <option value="PENDENTE">Pendente</option>
                                            </select>
                                        </div>
                                        <div className="saas-card p-4 flex items-center gap-3">
                                            <Zap className="text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="ID / Chapa..."
                                                className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>

                                        {/* Date Filters inside the same grid */}
                                        <div className="saas-card p-4 flex items-center gap-3 bg-slate-50/50 border-brand-primary/10">
                                            <Calendar className="text-brand-primary" size={18} />
                                            <div className="flex flex-col flex-1 pl-1">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Início Admissão</span>
                                                <input
                                                    type="date"
                                                    className="bg-transparent border-none outline-none text-sm font-black text-slate-700 w-full cursor-pointer"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="saas-card p-4 flex items-center gap-3 bg-slate-50/50 border-rose-500/10">
                                            <Calendar className="text-rose-500" size={18} />
                                            <div className="flex flex-col flex-1 pl-1">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fim Admissão</span>
                                                <input
                                                    type="date"
                                                    className="bg-transparent border-none outline-none text-sm font-black text-slate-700 w-full cursor-pointer"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>


                                    {/* Table Content */}
                                    <div className="saas-card p-0 overflow-hidden border-none shadow-floating">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-brand-primary to-brand-primary border-b-2 border-brand-secondary/20 shadow-sm">
                                                    <th className="py-5 px-8 text-[10px] font-black text-white/90 uppercase tracking-[0.15em]">Colaborador / ID</th>
                                                    <th className="py-5 px-4 text-[10px] font-black text-white/90 uppercase tracking-[0.15em]">Função</th>
                                                    <th className="py-5 px-4 text-[10px] font-black text-white/90 uppercase tracking-[0.15em]">Admissão</th>
                                                    <th className="py-5 px-4 text-[10px] font-black text-white/90 uppercase tracking-[0.15em]">Liberação</th>
                                                    <th className="py-5 px-4 text-[10px] font-black text-white/90 uppercase tracking-[0.15em]">Dias</th>
                                                    <th className="py-5 px-4 text-[10px] font-black text-white/90 uppercase tracking-[0.15em]">Checklist</th>
                                                    <th className="py-5 px-4 text-[10px] font-black text-white/90 uppercase tracking-[0.15em]">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredCollabs.map(c => (
                                                    <tr
                                                        key={c.chapa}
                                                        className="group hover:bg-violet-50/30 transition-all cursor-pointer"
                                                        onClick={() => setSelectedCollab(c)}
                                                    >
                                                        <td className="py-6 px-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm ${getEffectiveStatus(c) === 'LIBERADO' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                    ID
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-900 group-hover:text-brand-primary transition-colors">{c.name}</p>
                                                                    <p className="text-[10px] font-mono text-text-muted tracking-wider">{c.chapa}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-4">
                                                            <p className="text-sm font-bold text-slate-800">{c.role}</p>
                                                            <p className="text-[10px] text-text-muted font-bold uppercase">{c.area || 'N/D'}</p>
                                                        </td>
                                                        <td className="py-6 px-4">
                                                            <p className="text-xs font-bold text-slate-600">{c.admissionDate ? dayjs(c.admissionDate).format('DD/MM/YYYY') : '-'}</p>
                                                        </td>
                                                        <td className="py-6 px-4">
                                                            <p className="text-xs font-bold text-slate-600">{c.liberationDate ? dayjs(c.liberationDate).format('DD/MM/YYYY') : '-'}</p>
                                                        </td>
                                                        <td className="py-6 px-4">
                                                            <span className="text-xs font-black px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                                                                {calculateBusinessDays(c.admissionDate, c.liberationDate)}d
                                                            </span>
                                                        </td>
                                                        <td className="py-6 px-4">
                                                            <div className="flex gap-3">
                                                                {[
                                                                    { key: 'rh', label: 'RH' },
                                                                    { key: 'saude', label: 'SAÚDE' },
                                                                    { key: 'seguranca', label: 'SEGURANÇA' },
                                                                    { key: 'grd', label: 'GRD' }
                                                                ].map(step => {
                                                                    const styles = getStepStyles(step.label, c[step.key as keyof typeof c]);
                                                                    return (
                                                                        <div key={step.key} className="flex flex-col items-center gap-1">
                                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${styles.bg} ${styles.border} ${styles.text}`}>
                                                                                {c[step.key as keyof typeof c] === 'OK' ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                                            </div>
                                                                            <span className={`text-[8px] font-black uppercase tracking-wider ${styles.text}`}>
                                                                                {step.label}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-4">
                                                            <span className={`status-badge !px-3 !py-1 !text-[10px] ${getEffectiveStatus(c) === 'LIBERADO' ? 'status-liberado' : 'status-pendente'}`}>
                                                                {getEffectiveStatus(c)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {filteredCollabs.length === 0 && (
                                            <div className="py-20 flex flex-col items-center justify-center text-text-muted gap-4">
                                                <X size={48} strokeWidth={1} />
                                                <p className="font-bold">Nenhum colaborador encontrado.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'kanban' && (
                                <motion.div
                                    key="kanban"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    className="h-full flex items-center justify-center"
                                >
                                    <div className="text-center space-y-4">
                                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center shadow-lg">
                                            <KanbanIcon size={40} className="text-white" />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900">Área do Desenvolvedor</h2>
                                        <p className="text-text-muted font-medium max-w-md mx-auto">
                                            Esta seção está reservada para ferramentas e recursos exclusivos da equipe de desenvolvimento.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'functions' && (
                                <motion.div
                                    key="functions"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full pb-20"
                                >
                                    <div className="h-full flex flex-col pt-0 relative">
                                        <div className="flex justify-between items-center mb-2 shrink-0 sticky top-0 bg-saas-bg z-20 pt-1 pb-4 px-8 -mt-2 border-b border-slate-100 shadow-sm">
                                            {!selectedRole && (
                                                <div>
                                                    <div className="flex items-baseline gap-4 mb-0.5">
                                                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                                                            Funções & Equipes
                                                        </h1>
                                                    </div>
                                                    <p className="text-text-muted font-bold text-xs uppercase tracking-widest opacity-60">
                                                        Gerenciamento detalhado por função.
                                                    </p>
                                                </div>
                                            )}

                                            {activeRoleStats && (
                                                <div className="flex items-center gap-8 ml-auto">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">LeadTime Médio</span>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{activeRoleStats.leadTimeAvg}</span>
                                                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Dias</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-px h-10 bg-slate-200/60 mx-2" />
                                                    <div className="flex gap-3">
                                                        <div className="flex flex-col items-center bg-emerald-50/50 border border-emerald-100 px-4 py-2 rounded-2xl shadow-sm">
                                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Liberados</span>
                                                            <span className="text-lg font-black text-emerald-700">{activeRoleStats.liberated}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center bg-rose-50/50 border border-rose-100 px-4 py-2 rounded-2xl shadow-sm">
                                                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Pendentes</span>
                                                            <span className="text-lg font-black text-rose-700">{activeRoleStats.pending}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-h-0">
                                            <FunctionsView
                                                collaborators={collaborators}
                                                selectedRole={selectedRole}
                                                onRoleSelect={setSelectedRole}
                                                startDate={startDate}
                                                endDate={endDate}
                                                onSpreadsheetOpen={() => setIsSpreadsheetOpen(true)}
                                                onClearAll={() => {
                                                    setStartDate('2026-01-01');
                                                    setEndDate('2026-02-28');
                                                    setSelectedRole(null);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div >
                </div >

                {/* Global Spreadsheet Modal */}
                <RoleSpreadsheetModal
                    isOpen={isSpreadsheetOpen}
                    onClose={() => setIsSpreadsheetOpen(false)}
                    roleName={selectedRole || ''}
                    collaborators={(() => {
                        if (!selectedRole) return [];
                        const roleCollabs = collaborators.filter(c => c.role === selectedRole);
                        return roleCollabs.filter(c => {
                            const admission = c.admissionDate ? dayjs(c.admissionDate) : null;
                            const start = startDate ? dayjs(startDate) : null;
                            const end = endDate ? dayjs(endDate) : null;
                            if (!admission) return false;
                            if (start && admission.isBefore(start, 'day')) return false;
                            if (end && admission.isAfter(end, 'day')) return false;
                            return true;
                        });
                    })()}
                />
            </main >

            {/* --- DETALHES MODAL --- */}
            <AnimatePresence>
                {
                    selectedCollab && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
                            onClick={() => setSelectedCollab(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-floating overflow-hidden relative"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-10">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl ${getEffectiveStatus(selectedCollab) === 'LIBERADO' ? 'bg-brand-primary' : 'bg-red-500'}`}>
                                                <ShieldCheck size={40} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900">{selectedCollab.name}</h2>
                                                <p className="text-sm font-bold text-text-muted mt-1 uppercase tracking-widest">{selectedCollab.role}</p>
                                                <p className="text-[10px] font-mono font-black text-brand-primary mt-2">ID: {selectedCollab.chapa}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedCollab(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        {[
                                            { label: 'RH', status: selectedCollab.rh, desc: 'Documentação' },
                                            { label: 'Saúde', status: selectedCollab.saude, desc: 'Exame ASO' },
                                            { label: 'Segurança', status: selectedCollab.seguranca, desc: 'Treinamento' },
                                            { label: 'GRD', status: selectedCollab.grd, desc: 'Liberação Final' },
                                        ].map((item, idx) => {
                                            const styles = getStepStyles(item.label, item.status);
                                            return (
                                                <div key={idx} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${styles.bg} ${styles.text}`}>
                                                        {item.status === 'OK' ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                                    </div>
                                                    <div>
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${styles.text}`}>{item.label}</p>
                                                        <p className={`text-xs font-bold ${item.status === 'OK' ? 'text-slate-700' : 'text-red-500'}`}>
                                                            {item.status === 'OK' ? 'CONCLUÍDO' : 'PENDENTE'}
                                                        </p>
                                                        <p className="text-[9px] text-slate-300 font-medium">{item.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Novas Seções de Datas */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Data Admissão</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {selectedCollab.admissionDate ? dayjs(selectedCollab.admissionDate).format('DD/MM/YYYY') : 'Não informada'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Liberação E-coordina</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {selectedCollab.liberationDate ? dayjs(selectedCollab.liberationDate).format('DD/MM/YYYY') : 'Pendente'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`p-8 rounded-[2rem] border-2 flex items-center justify-between transition-all ${getEffectiveStatus(selectedCollab) === 'LIBERADO' ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200'}`}>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Tempo Total de Liberação</p>
                                            <h3 className={`text-2xl font-black ${getEffectiveStatus(selectedCollab) === 'LIBERADO' ? 'text-emerald-700' : 'text-red-600'}`}>
                                                {calculateBusinessDays(selectedCollab.admissionDate, selectedCollab.liberationDate)} Dias Úteis
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* --- PREVIEW MODAL --- */}
            <AnimatePresence>
                {
                    showPreview && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
                            onClick={() => setShowPreview(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                                className="bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-floating overflow-hidden relative flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-8 border-b border-saas-border flex justify-between items-center bg-brand-primary text-white">
                                    <div>
                                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                            Pré-visualização do Relatório
                                            <span className="text-xs bg-white text-brand-primary px-3 py-1 rounded-full font-bold">
                                                {filteredCollabs.length} Registros
                                            </span>
                                        </h2>
                                        <p className="text-sm text-white/70 font-medium mt-1">Confira os dados antes de gerar o arquivo final.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex bg-white rounded-xl shadow-sm border border-saas-border p-1">
                                            <button
                                                onClick={handleExportExcel}
                                                className="px-4 py-2 hover:bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black transition-all flex items-center gap-2"
                                            >
                                                <Download size={14} />
                                                EXCEL
                                            </button>
                                            <div className="w-px bg-slate-100 my-1 mx-1" />
                                            <button
                                                onClick={handleExportPDF}
                                                className="px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg text-xs font-black transition-all flex items-center gap-2"
                                            >
                                                <Download size={14} />
                                                PDF
                                            </button>
                                        </div>
                                        <button onClick={() => setShowPreview(false)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                                                <th className="pb-4 px-4 font-black">ID / Chapa</th>
                                                <th className="pb-4 px-4 font-black">Colaborador</th>
                                                <th className="pb-4 px-4 font-black">Admissão</th>
                                                <th className="pb-4 px-4 font-black">Liberação</th>
                                                <th className="pb-4 px-4 font-black text-center">Dias</th>
                                                <th className="pb-4 px-4 font-black text-center">RH</th>
                                                <th className="pb-4 px-4 font-black text-center">Sau.</th>
                                                <th className="pb-4 px-4 font-black text-center">Seg.</th>
                                                <th className="pb-4 px-4 font-black text-center">GRD</th>
                                                <th className="pb-4 px-4 font-black text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredCollabs.map((c) => (
                                                <tr key={c.chapa} className="group hover:bg-slate-50 transition-all">
                                                    <td className="py-4 px-4 text-xs font-mono font-bold text-slate-400">{c.chapa}</td>
                                                    <td className="py-4 px-4 text-sm font-black text-slate-900">
                                                        {c.name}
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{c.role}</p>
                                                    </td>
                                                    <td className="py-4 px-4 text-xs font-bold text-slate-600">{c.admissionDate ? dayjs(c.admissionDate).format('DD/MM/YYYY') : '-'}</td>
                                                    <td className="py-4 px-4 text-xs font-bold text-slate-600">{c.liberationDate ? dayjs(c.liberationDate).format('DD/MM/YYYY') : '-'}</td>
                                                    <td className="py-4 px-4 text-center">
                                                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                                                            {calculateBusinessDays(c.admissionDate, c.liberationDate)}d
                                                        </span>
                                                    </td>
                                                    {['rh', 'saude', 'seguranca', 'grd'].map(step => {
                                                        const label = step === 'rh' ? 'RH' : step === 'saude' ? 'SAÚDE' : step === 'seguranca' ? 'SEGURANÇA' : 'GRD';
                                                        const styles = getStepStyles(label, c[step as keyof typeof c]);
                                                        const isOk = c[step as keyof typeof c] === 'OK';
                                                        return (
                                                            <td key={step} className="py-4 px-4 text-center">
                                                                <div className={`w-5 h-5 mx-auto rounded flex items-center justify-center ${isOk ? styles.text : 'text-slate-200'}`}>
                                                                    <CheckCircle2 size={12} strokeWidth={3} />
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="py-4 px-4 text-right">
                                                        <span className={`status-badge !text-[9px] ${getEffectiveStatus(c) === 'LIBERADO' ? 'status-liberado' : 'status-pendente'}`}>
                                                            {getEffectiveStatus(c)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
            </AnimatePresence>
        </div>
    );
};

export default App;
