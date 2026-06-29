import type { Ticket, TicketCreate, TicketPriority, TicketStatus } from '../types';
import { notificationService } from './notificationService';

export const MOCK_TICKETS: Ticket[] = [
  { id: '1', name: 'João Cliente', protocol: '1042', subject: 'Produto com defeito', category: 'Produto', status: 'open', priority: 'high', date: '19/05/2025', time: '14:30', description: 'Recebi o lote com embalagens danificadas. Preciso de substituição urgente.', clientType: 'retail' },
  { id: '2', name: 'João Cliente', protocol: '1039', subject: 'Atraso na entrega', category: 'Entrega', status: 'inProgress', priority: 'medium', date: '17/05/2025', time: '09:15', description: 'O pedido estava previsto para o dia 15 mas ainda não chegou.', clientType: 'retail', responses: [{ id: 'r1', text: 'Verificamos com a transportadora, o pedido está a caminho e chega em 2 dias úteis.', author: 'Ana Supervisora', authorRole: 'supervisor', createdAt: '10:00' }] },
  { id: '3', name: 'João Cliente', protocol: '1031', subject: 'Dúvida no boleto', category: 'Faturamento', status: 'closed', priority: 'low', date: '10/05/2025', time: '11:00', description: 'Não entendi a cobrança adicional na fatura de abril.', clientType: 'retail', rating: { stars: 4, comment: 'Atendimento rápido!' } },
  { id: '4', name: 'João Cliente', protocol: '1028', subject: 'Solicitação de consultor', category: 'Comercial', status: 'closed', priority: 'medium', date: '05/05/2025', time: '16:45', description: 'Gostaria de falar com um consultor para renegociar meu plano.', clientType: 'retail' },
];

export const ticketService = {
  getMyTickets: async (clientName?: string): Promise<Ticket[]> => {
    if (!clientName) return [...MOCK_TICKETS];
    return MOCK_TICKETS.filter(t => t.name === clientName);
  },

  getAllTickets: async (): Promise<Ticket[]> => [...MOCK_TICKETS],

  updateTicketStatus: async (id: string, status: TicketStatus): Promise<void> => {
    const t = MOCK_TICKETS.find(t => t.id === id);
    if (t) t.status = status;
  },

  updateTicketPriority: async (id: string, priority: TicketPriority): Promise<void> => {
    const t = MOCK_TICKETS.find(t => t.id === id);
    if (t) t.priority = priority;
  },

  addResponse: async (id: string, text: string, author: string, authorRole: 'supervisor' | 'admin' | 'user'): Promise<void> => {
    const t = MOCK_TICKETS.find(t => t.id === id);
    if (t) {
      if (!t.responses) t.responses = [];
      t.responses.push({
        id: Date.now().toString(),
        text,
        author,
        authorRole,
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });
      if (t.status === 'open') t.status = 'inProgress'; // atualiza para em andamento
    }
  },

  rateTicket: async (id: string, stars: number, comment?: string): Promise<void> => {
    const t = MOCK_TICKETS.find(t => t.id === id);
    if (t) t.rating = { stars, comment };
  },

  createTicket: async (data: TicketCreate): Promise<Ticket> => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      status: 'open',
      priority: 'medium',
      protocol: String(Math.floor(1000 + Math.random() * 9000)),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ...data,
    };
    MOCK_TICKETS.unshift(newTicket);
    notificationService.addTicketNotification({
      protocol: newTicket.protocol,
      subject: newTicket.subject,
      clientName: newTicket.name,
    });
    return newTicket;
  },
};
