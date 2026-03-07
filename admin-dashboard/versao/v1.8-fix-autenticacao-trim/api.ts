import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { Collaborator } from '../types';

dayjs.extend(customParseFormat);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


/**
 * Verifica acesso do usuário na tabela user_mob
 */
export const checkUserAccess = async (email: string, password: string) => {
    try {
        // Busca pelo email e compara senha no JS com trim() para evitar \n no banco
        const { data, error } = await supabase
            .from('user_mob')
            .select('*')
            .eq('email', email.trim())
            .single();

        if (error) throw error;
        if (!data) return null;

        // Compara senha ignorando espaços/quebras de linha extras no banco
        const senhaCorreta = String(data.senha).trim() === password.trim();
        if (!senhaCorreta) return null;

        return data;
    } catch (err) {
        console.error('Erro na autenticação:', err);
        return null;
    }
};

/**
 * Calcula a diferença de dias úteis entre duas datas (exclui fins de semana)
 */
export const calculateBusinessDays = (start: string | undefined, end: string | undefined): number => {
    if (!start || !end) return 0;

    let startDate = dayjs(start);
    let endDate = dayjs(end);

    if (!startDate.isValid() || !endDate.isValid()) return 0;
    if (startDate.isAfter(endDate)) return 0;

    let count = 0;
    let current = startDate;

    while (current.isBefore(endDate, 'day') || current.isSame(endDate, 'day')) {
        const dayOfWeek = current.day();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
            count++;
        }
        current = current.add(1, 'day');
    }

    return count;
};


/**
 * Busca defensiva de campos em um objeto (ignora case e acentos)
 */
const getFieldDefensive = (row: any, patterns: string[]) => {
    const keys = Object.keys(row);
    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const normalizedPatterns = patterns.map(p => normalize(p));

    // 1. Match exato normalizado
    let match = keys.find(k => normalizedPatterns.some(p => normalize(k) === p));
    if (match) return row[match];

    // 2. Match parcial (ex: 'data_solicitacao' inclui 'solicitacao')
    match = keys.find(k => normalizedPatterns.some(p => normalize(k).includes(p)));
    return match ? row[match] : undefined;
};

/**
 * Busca todos os colaboradores diretamente da tabela do Supabase (consolidado)
 */
export const fetchCollaborators = async (): Promise<Collaborator[]> => {
    try {
        const { data, error } = await supabase
            .from('liberation_data')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => {
            const rawName = getFieldDefensive(row, ['nome', 'colaborador', 'funcionario', 'name']);
            const chapa = String(getFieldDefensive(row, ['chapa', 'matricula', 'id', 'mat']) || '').trim();

            // Lógica de Status Simplificada (Paridade Total com Mobile/Planilha)
            // Agora exige OK em RH, SAÚDE, SEGURANÇA e GRD para ser LIBERADO
            const isFullyLiberated =
                row.rh === 'OK' &&
                row.saude === 'OK' &&
                row.seguranca === 'OK' &&
                row.grd === 'OK';

            const collab: Collaborator = {
                chapa: chapa,
                name: rawName || chapa || 'Aguardando Colaborador',
                role: getFieldDefensive(row, ['função', 'cargo', 'role']) || 'Sem Função',
                status: isFullyLiberated ? 'LIBERADO' : 'PENDENTE',
                area: getFieldDefensive(row, ['area', 'setor', 'equipe']) || 'Sem Área',
                admissionDate: getFieldDefensive(row, ['data_admissao', 'admissao']),
                rh: row.rh || 'PENDENTE',
                saude: row.saude || 'PENDENTE',
                seguranca: row.seguranca || 'PENDENTE',
                grd: row.grd || 'PENDENTE',
                liberationDate: getFieldDefensive(row, ['liberacao_ecoordin', 'liberacao']),
                rhFinishedAt: row.rh_finished_at,
                saudeFinishedAt: row.saude_finished_at,
                segurancaFinishedAt: row.seguranca_finished_at,
                updatedAt: row.updated_at
            };

            return collab;
        });
    } catch (err) {
        console.error('Erro na busca do Supabase:', err);
        return [];
    }
};

/**
 * Listener em tempo real para Logs de Sincronização
 */
export const subscribeToSyncLogs = (callback: (payload: any) => void) => {
    return supabase
        .channel('sync_logs_channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sync_logs' }, callback)
        .subscribe();
};
