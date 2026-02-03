export interface Collaborator {
    chapa: string;
    name: string;
    role: string;
    status: string;
    area: string;
    // Novos campos para paridade com Mobile/Supabase
    rh?: string;
    saude?: string;
    seguranca?: string;
    grd?: string;
    updatedAt?: string;
    // Datas para controle de SLA
    admissionDate?: string;
    liberationDate?: string;
}

export interface LiberationData {
    chapa: string;
    nome: string;
    funcao: string;
    area: string;
    cid: string;
    rh: string;
    saude: string;
    seguranca: string;
    grd: string;
    obs_grd: string;
    data_admissao: string;
    liberacao_ecoordin: string;
    envio_cliente: string;
    updated_at: string;
}

export type SyncLog = {
    id: string;
    created_at: string;
    service: string;
    message: string;
    status: 'SUCCESS' | 'ERROR' | 'INFO';
};
