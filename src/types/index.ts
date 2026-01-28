export interface Collaborator {
    rowId: number;
    name: string;
    role: string;
    status: string;
    requestDate?: string;
    approvalDate?: string;
    expectedArrival?: string;
    ticketDate?: string;
    examScheduled?: string;
    examDate?: string;
    asoReleased?: string;
    offerLetterDate?: string;
    examLocation?: string;
    admissionDate?: string;
    ecoordinaReleaseDate?: string;
    requester?: string;
    area?: string;
    city?: string;
    state?: string;
    observation?: string;
    cip?: string;
    cancellationDate?: string;
    is_deleted?: boolean;
    is_zombie?: boolean;
    [key: string]: any;
}

export interface StatusHistory {
    id: string;
    rowId: number;
    collaboratorName: string;
    requester?: string;
    oldStatus: string;
    newStatus: string;
    role?: string;
    date: string;
    changed_by?: string;
}

export interface LeadTimeData {
    name: string;
    role: string;
    daysInSelection: number;
    daysInDoc: number;
    daysInExam: number;
    daysInTravel: number;
    totalDays: number;
}

export interface RequesterSession {
    email: string;
    name: string;
    area?: string;
}

export interface LiberationData {
    mat: string;
    nome: string;
    funcao?: string;
    area?: string;
    cid?: string;
    rh?: string;
    saude?: string;
    seguranca?: string;
    grd?: string;
    obs_grd?: string;
    data_admissao?: string;
    liberacao_ecoordin?: string;
    envio_cliente?: string;
    updated_at?: string;
}
