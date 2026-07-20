import type { Ticket, TicketCreate, TicketPriority, TicketStatus } from '../types';
import { apiGet, apiPost, apiPut } from './api';
import { notificationService } from './notificationService';

// ─── Field mapping: App ↔ Backend ───────────────────────────────────────────

const CAT_FWD: Record<string, string> = {
  'Entrega':    'Logistica',
  'Faturamento':'Contas a Pagar',
  'Produto':    'Comercial',
  'Comercial':  'Comercial',
  'Suporte TI': 'T.I',
  'Outro':      'T.I',
};

const CAT_BACK: Record<string, string> = {
  'Logistica':       'Entrega',
  'Contas a Pagar':  'Faturamento',
  'Contas a Receber':'Faturamento',
  'Comercial':       'Comercial',
  'T.I':             'Suporte TI',
  'Compras':         'Produto',
};

const PRIORITY_FWD: Record<TicketPriority, string> = {
  high:   'Alta Prioridade',
  medium: 'Média Prioridade',
  low:    'Baixa Prioridade',
};

const PRIORITY_BACK: Record<string, TicketPriority> = {
  'Alta Prioridade':  'high',
  'Média Prioridade': 'medium',
  'Baixa Prioridade': 'low',
};

const STATUS_BACK: Record<string, TicketStatus> = {
  'aberto':       'open',
  'em andamento': 'inProgress',
  'concluido':    'closed',
  'encerrado':    'closed',
};

const mapCommentRole = (perfil?: string): 'supervisor' | 'admin' | 'user' => {
  if (perfil === 'supervisor' || perfil === 'gerente') return 'supervisor';
  if (perfil === 'atendente') return 'admin';
  return 'user';
};

const mapBackendToTicket = (data: any): Ticket => ({
  id:          data._id ?? data.id ?? '',
  name:        data.nomeCliente ?? '',
  subject:     data.assuntoEspecifico ?? '',
  status:      STATUS_BACK[data.avanco] ?? 'open',
  protocol:    data.numeroProtocolo ?? `KZY${Date.now().toString().slice(-6)}`,
  clientType:  'retail',
  category:    CAT_BACK[data.categoriaAssunto] ?? data.categoriaAssunto ?? 'Outro',
  priority:    PRIORITY_BACK[data.nivelPrioridade] ?? 'medium',
  date:        data.dataAtendimento ?? new Date().toISOString().split('T')[0],
  time:        data.hora ?? '',
  description: data.descricaoDetalhada ?? '',
  responses:   (data.comentarios ?? []).map((c: any) => ({
    id:         c._id ?? `c_${Date.now()}`,
    text:       c.mensagem ?? '',
    author:     c.usuario?.nomeCompleto ?? 'Suporte',
    authorRole: mapCommentRole(c.usuario?.perfilAcesso),
    createdAt:  c.dataCriacao ?? '',
  })),
  createdAt:  data.createdAt,
  updatedAt:  data.updatedAt,
  assignedTo: data.atendente,
});

const getNowTime = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const ticketService = {
  getMyTickets: async (_clientName?: string): Promise<Ticket[]> => {
    try {
      const raw = await apiGet<any[]>('/atendimentos');
      return (raw ?? []).map(mapBackendToTicket);
    } catch {
      return [];
    }
  },

  getAllTickets: async (): Promise<Ticket[]> => {
    try {
      const raw = await apiGet<any[]>('/atendimentos');
      return (raw ?? []).map(mapBackendToTicket);
    } catch {
      return [];
    }
  },

  getTicketById: async (id: string): Promise<any | null> => {
    try {
      return await apiGet<any>(`/atendimentos/${id}`);
    } catch {
      return null;
    }
  },

  createTicket: async (data: TicketCreate): Promise<Ticket> => {
    const body = {
      nomeCliente:       data.name,
      tipoCliente:       'cliente',
      categoriaAssunto:  CAT_FWD[data.category] ?? data.category,
      assuntoEspecifico: data.subject,
      hora:              getNowTime(),
      descricaoDetalhada: data.description,
      nivelPrioridade:   PRIORITY_FWD[data.priority ?? 'medium'],
      origem:            'whatsapp',
    };
    const response = await apiPost<any>('/atendimentos', body);
    const ticket = mapBackendToTicket(response);
    notificationService.addTicketNotification({
      protocol: ticket.protocol,
      subject: ticket.subject,
      clientName: ticket.name,
    });
    return ticket;
  },

  createLiveChatTicket: async (nomeCliente: string): Promise<Ticket> => {
    return ticketService.createTicket({
      name:        nomeCliente,
      subject:     'Solicitação de atendimento humano via chat ao vivo',
      clientType:  'retail',
      category:    'Outro',
      priority:    'medium',
      description: 'Cliente solicitou atendimento com um consultor humano através do chat ao vivo.',
    });
  },

  addComment: async (ticketId: string, mensagem: string): Promise<void> => {
    await apiPost(`/atendimentos/${ticketId}/comentarios`, { mensagem, isPrivado: false });
  },

  updateTicketStatus: async (id: string, status: TicketStatus): Promise<void> => {
    const avanco = Object.keys(STATUS_BACK).find(k => STATUS_BACK[k] === status) ?? 'aberto';
    await apiPut(`/atendimentos/${id}`, { avanco });
  },

  updateTicketPriority: async (id: string, priority: TicketPriority): Promise<void> => {
    await apiPut(`/atendimentos/${id}`, { nivelPrioridade: PRIORITY_FWD[priority] });
  },

  addResponse: async (id: string, text: string, _author: string, _authorRole: string): Promise<void> => {
    await apiPost(`/atendimentos/${id}/comentarios`, { mensagem: text, isPrivado: false });
  },

  getStats: async (): Promise<{ open: number; inProgress: number; closed: number } | null> => {
    try {
      const data = await apiGet<any>('/atendimentos/estatisticas');
      return {
        open:       data.abertos       ?? 0,
        inProgress: data.emAndamento   ?? 0,
        closed:     (data.concluidos ?? 0) + (data.encerrados ?? 0),
      };
    } catch {
      return null;
    }
  },

  rateTicket: async (id: string, stars: number, comment?: string): Promise<void> => {
    await apiPut(`/atendimentos/${id}`, { avaliacao: { estrelas: stars, comentario: comment } });
  },
};
