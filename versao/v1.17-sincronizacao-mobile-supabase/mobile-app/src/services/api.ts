import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { createClient } from '@supabase/supabase-js';
import type { Collaborator, LiberationData } from '../types';

dayjs.extend(customParseFormat);

// Funções de CSV removidas - Migrado para Supabase


// CSV_URL removido - Migrado para Supabase


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchCollaborators = async (): Promise<Collaborator[]> => {
    try {
        console.log('Fetching Collaborators from Supabase table: liberation_data');
        const { data, error } = await supabase
            .from('liberation_data')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any, index: number) => {
            // Lógica de Status Unificada (Paridade com Admin Dashboard)
            const isFullyLiberated =
                row.rh === 'OK' &&
                row.saude === 'OK' &&
                row.seguranca === 'OK' &&
                row.grd === 'OK';

            return {
                rowId: index + 1, // Mantemos um rowId numérico para compatibilidade de UI
                chapa: String(row.chapa || '').trim(),
                name: String(row.nome || row.chapa || 'Aguardando Colaborador').trim(),
                role: row.funcao || 'Sem Função',
                status: isFullyLiberated ? 'LIBERADO' : 'PENDENTE',
                area: row.area || 'Sem Área',
                admissionDate: row.data_admissao,
                rh: row.rh || 'PENDENTE',
                saude: row.saude || 'PENDENTE',
                seguranca: row.seguranca || 'PENDENTE',
                grd: row.grd || 'PENDENTE',
                liberationDate: row.liberacao_ecoordin,
                updatedAt: row.updated_at,
                // Mapeamento de campos legados para evitar quebras bruscas na UI
                requestDate: row.data_admissao, // Fallback
                approvalDate: row.updated_at,   // Fallback
            } as Collaborator;
        });
    } catch (error) {
        console.error('Error fetching collaborators from Supabase:', error);
        return [];
    }
};

export const login = async (email: string, password: string): Promise<{ name: string, email: string } | null> => {
    try {
        const { data, error } = await supabase
            .from('mobile_auth')
            .select('name, email, password')
            .eq('email', email)
            .single();

        if (error || !data) return null;

        if (data.password === password) {
            return { name: data.name, email: data.email };
        }

        return null;
    } catch (err) {
        console.error('Login error:', err);
        return null;
    }
};

export const calculateLeadTime = (collab: Collaborator) => {
    const parseDate = (d?: string) => {
        if (!d) return null;
        const formats = ['DD/MM/YYYY', 'YYYY-MM-DD', 'DD/MM/YY'];
        for (const f of formats) {
            const m = dayjs(d, f);
            if (m.isValid()) return m;
        }
        return null;
    };

    const getBusinessDays = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
        let count = 0;
        let cur = start.clone();
        while (cur.isBefore(end, 'day')) {
            const day = cur.day();
            if (day !== 0 && day !== 6) count++;
            cur = cur.add(1, 'day');
        }
        return count;
    };

    const start = parseDate(collab.approvalDate || collab.requestDate);
    const end = collab.status === 'ADMITIDO' ? parseDate(collab.admissionDate) : dayjs();

    if (!start || !end) return 0;
    return getBusinessDays(start, end);
};

export const fetchLiberationData = async (): Promise<LiberationData[]> => {
    try {
        console.log('Fetching Liberation Data from Supabase table: liberation_data');
        const { data, error } = await supabase
            .from('liberation_data')
            .select('*');

        if (error) throw error;

        // Mapeia os nomes das colunas do Supabase para o que o app espera
        return (data || []).map(row => ({
            ...row,
            mat: String(row.chapa || '').trim(),
            nome: String(row.nome || row.chapa || '').trim(), // Usa chapa se nome não existir
            funcao: row.funcao || 'Sem Função',
            data_liberacao_ecoordin: row.liberacao_ecoordin || row.data_liberacao_ecoordin,
            updated_at: row.updated_at || new Date().toISOString()
        })) as LiberationData[];
    } catch (error) {
        console.error('Error fetching liberation data from Supabase:', error);
        return [];
    }
};

export const fetchLiberationByMat = async (search: string): Promise<LiberationData | null> => {
    try {
        const term = search.trim();
        const { data, error } = await supabase
            .from('liberation_data')
            .select('*')
            .or(`chapa.eq.${term},nome.ilike.%${term}%`)
            .limit(1)
            .maybeSingle();

        if (error) {
            // Se a coluna 'nome' não existir no banco, tenta buscar apenas por 'chapa'
            if (error.message?.includes('column "nome" does not exist')) {
                const { data: retryData, error: retryError } = await supabase
                    .from('liberation_data')
                    .select('*')
                    .eq('chapa', term)
                    .limit(1)
                    .maybeSingle();
                if (retryError) throw retryError;
                if (!retryData) return null;
                return {
                    ...retryData,
                    mat: String(retryData.chapa || '').trim(),
                    nome: String(retryData.nome || retryData.chapa || '').trim(),
                    funcao: retryData.funcao || 'Sem Função',
                    data_liberacao_ecoordin: retryData.liberacao_ecoordin || retryData.data_liberacao_ecoordin
                } as LiberationData;
            }
            throw error;
        }

        if (!data) return null;

        return {
            ...data,
            mat: String(data.chapa || '').trim(),
            nome: String(data.nome || data.chapa || '').trim(),
            funcao: data.funcao || 'Sem Função',
            data_liberacao_ecoordin: data.liberacao_ecoordin || data.data_liberacao_ecoordin
        } as LiberationData;
    } catch (err) {
        console.error('Liberation fetch error from Supabase:', err);
        return null;
    }
};
