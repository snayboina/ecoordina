import Papa from 'papaparse';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { createClient } from '@supabase/supabase-js';
import type { Collaborator, LiberationData } from '../types';

dayjs.extend(customParseFormat);

const getStableGoogleCsvUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed.includes('docs.google.com/spreadsheets/d/')) return trimmed;

    // Extrai o ID da planilha e o GID
    const idMatch = trimmed.match(/\/d\/([^/]+)/);
    const gidMatch = trimmed.match(/gid=([^&]+)/);

    if (idMatch) {
        const id = idMatch[1];
        const gid = gidMatch ? gidMatch[1] : '0';
        // Endpoint gviz/tq é muito mais estável para fetch direto (CORS friendly)
        return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
    }
    return trimmed;
};

const CSV_URL = getStableGoogleCsvUrl(import.meta.env.VITE_SPREADSHEET_URL || 'https://docs.google.com/spreadsheets/d/1yLnwKTo1yM-fmlzX5cDzrIlbg2-BjbME/export?format=csv');

const LIBERATION_CSV_URL = getStableGoogleCsvUrl(import.meta.env.VITE_LIBERATION_SPREADSHEET_URL || 'https://docs.google.com/spreadsheets/d/1zYOgUNgNkUA5C5N2pLZ-0ub5Um_uZ2inCh0YDi1JDSo/export?format=csv&gid=0');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchCollaborators = async (): Promise<Collaborator[]> => {
    try {
        console.log('Fetching Collaborators from:', CSV_URL);
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvRawText = await response.text();

        const normalizeKey = (str: any) => {
            if (!str) return '';
            const s = typeof str === 'string' ? str : String(str);
            return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        };

        const normalizeStatus = (s: string) => {
            const val = (s || '').trim().toUpperCase();
            if (val.startsWith('ADMITID')) return 'ADMITIDO';
            if (val.includes('ASO') && val.includes('AG')) return 'AGUARDANDO ASO';
            if (val.includes('CARTA') && val.includes('AG')) return 'AGUARDANDO ACEITE DA CARTA';
            if (val.includes('DOC') && (val.includes('AG') || val.includes('PENDENTE'))) return 'AGUARDANDO DOCUMENTOS';
            if (val.includes('VIAGEM') && val.includes('AG')) return 'AGUARDANDO VIAGEM';
            if (val.includes('RM') && (val.includes('LANC') || val.includes('SOL'))) return 'LANÇAR NO RM';
            if (val.includes('SELEC') || val.includes('RECRUT') || val.includes('TRIAGEM')) return 'EM SELEÇÃO';
            if (val.includes('SUBST') || val.includes('MOVIMENTA')) return 'SUBSTITUIR';
            if (val.includes('STAND')) return 'STAND BY';
            if (val.includes('TRANSF')) return 'TRANSFERIDO';
            return val.replace(/\bVIAJEM\b/g, 'VIAGEM') || 'SEM STATUS';
        };

        const lines = csvRawText.split('\n');
        let headerLineIndex = lines.findIndex(l => {
            const lower = l.toLowerCase();
            return (lower.includes('status') || lower.includes('situação')) &&
                (lower.includes('nome') || lower.includes('colaborador'));
        });

        if (headerLineIndex === -1) {
            headerLineIndex = lines.findIndex(l => l.split(',').length > 5 && !l.includes('#VALUE!'));
        }

        const validCsvContent = headerLineIndex !== -1 ? lines.slice(headerLineIndex).join('\n') : csvRawText;

        return new Promise<Collaborator[]>((resolve, reject) => {
            Papa.parse(validCsvContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results: Papa.ParseResult<any>) => {
                    const mapped = results.data
                        .filter((row: any) => {
                            const keys = Object.keys(row);
                            return keys.some(k => String(row[k] || '').trim() !== '');
                        })
                        .map((row: any, index: number) => {
                            const keys = Object.keys(row);
                            const findKey = (patterns: string[]) => {
                                const normalizedPatterns = patterns.map(p => normalizeKey(p));
                                let match = keys.find(k => normalizedPatterns.some(p => normalizeKey(k) === p) && row[k]?.toString().trim());
                                if (match) return row[match].toString().trim();

                                const actualKey = keys.find(k => {
                                    const normK = normalizeKey(k);
                                    return normalizedPatterns.some(p => normK.includes(p) || p.includes(normK));
                                });
                                return actualKey ? row[actualKey].toString().trim() : undefined;
                            };

                            const rawStatus = findKey(['status', 'situação', 'etapa']) || 'Sem Status';

                            const rawName = findKey(['nome', 'colaborador', 'funcionário']);
                            const name = (!rawName || /^\d+$/.test(rawName)) ? 'Aguardando Colaborador' : rawName;

                            return {
                                ...row,
                                rowId: row.rowId || index + 1,
                                name: name,
                                role: findKey(['função', 'cargo']) || 'Sem Função',
                                status: normalizeStatus(rawStatus),
                                requestDate: findKey(['data da solicitação', 'data de solicitação', 'solicitação', 'solicita']),
                                approvalDate: findKey(['data aprovação', 'data de aprovação', 'aprovação', 'aprovada']),
                                ticketDate: findKey(['passagem', 'emissão passagem', 'data passagem', 'ticket', 'flight']),
                                expectedArrival: findKey(['previsão de chegada', 'chegada', 'prev. chegada']),
                                examScheduled: findKey(['agendamento de exame', 'agendamento exame', 'agendamento']),
                                examDate: findKey(['data de exame', 'data do exame', 'dt exame', 'exame']),
                                asoReleased: findKey(['data do aso liberado soc', 'aso liberado', 'aso', 'liberação aso']),
                                offerLetterDate: findKey(['carta oferta', 'carta', 'oferta']),
                                admissionDate: findKey(['data de admissão', 'data de admissao', 'previsão para admissão', 'admissão']),
                                area: findKey(['area', 'área', 'setor', 'equipe']),
                                city: findKey(['cidade', 'município', 'city']),
                                state: findKey(['uf', 'estado', 'state']),
                                requester: findKey(['solicitante', 'requerente', 'requestor', 'responsavel']),
                            } as Collaborator;
                        });
                    resolve(mapped);
                },
                error: (error: any) => reject(error)
            });
        });
    } catch (error) {
        console.error('Error fetching collaborators:', error);
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
        console.log('Fetching Liberation Data from:', LIBERATION_CSV_URL);
        const response = await fetch(LIBERATION_CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvRawText = await response.text();

        return new Promise<LiberationData[]>((resolve, reject) => {
            Papa.parse(csvRawText, {
                header: true,
                skipEmptyLines: true,
                complete: (results: Papa.ParseResult<any>) => {
                    const mapped = results.data
                        .filter((row: any) => row.MAT || row.NOME)
                        .map((row: any) => ({
                            mat: String(row.MAT || row.CHAPA || '').trim(),
                            nome: String(row.NOME || '').trim(),
                            funcao: row['FUNÇÃO RM ATUALIZADA'] || row['FUNCAO'] || row['FUNÇÃO'],
                            area: row['AREA DE NEGOCIO'] || row['AREA'],
                            cid: row['CIP DE LIBERAÇÃO'] || row['CID'],
                            rh: row.RH,
                            saude: row.SAÚDE || row.SAUDE,
                            seguranca: row.SEGURANÇA || row.SEGURANCA,
                            grd: row.GRD,
                            obs_grd: row['OBSERVAÇÃO GRD'] || row['OBSERVACAO GRD'],
                            data_admissao: row['DATA ADMISSÃO'] || row['DATA_ADMISSAO'] || row['DATA ADMISSAO'],
                            data_liberacao_ecoordin: row['DATA DE LIBERAÇÃO E-COORDINA'] || row['DATA DE LIBERERAÇÃO'] || row['LiberaçãoEcoordina'],
                            envio_cliente: row['ENVIO PARA O CLIENTE'] || row['Envio para o cliente'],
                            updated_at: new Date().toISOString()
                        }));
                    resolve(mapped);
                },
                error: (error: any) => reject(error)
            });
        });
    } catch (error) {
        console.error('Error fetching liberation data:', error);
        return [];
    }
};

export const fetchLiberationByMat = async (search: string): Promise<LiberationData | null> => {
    try {
        const allData = await fetchLiberationData();
        const term = search.trim().toLowerCase();

        return allData.find(d =>
            d.mat.toLowerCase() === term ||
            d.nome.toLowerCase().includes(term)
        ) || null;
    } catch (err) {
        console.error('Liberation fetch error:', err);
        return null;
    }
};
