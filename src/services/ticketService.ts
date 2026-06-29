// src/services/ticketService.ts
// Mock centralizado — troca Promise.resolve() por apiGet/apiPost quando o backend estiver pronto
import type { Ticket, TicketCreate } from '../types';

const MOCK_TICKETS: Ticket[] = [
  { id: '1', name: 'Maicon Pereira', protocol: '1042', subject: 'Produto com defeito', category: 'Produto', status: 'open', priority: 'high', date: '19/05/2025', time: '14:30', description: 'Recebi o lote com embalagens danificadas. Preciso de substituição urgente.', clientType: 'retail' },
  { id: '2', name: 'Maicon Pereira', protocol: '1039', subject: 'Atraso na entrega', category: 'Entrega', status: 'inProgress', priority: 'medium', date: '17/05/2025', time: '09:15', description: 'O pedido estava previsto para o dia 15 mas ainda não chegou.', clientType: 'retail' },
  { id: '3', name: 'Maicon Pereira', protocol: '1031', subject: 'Dúvida no boleto', category: 'Faturamento', status: 'closed', priority: 'low', date: '10/05/2025', time: '11:00', description: 'Não entendi a cobrança adicional na fatura de abril.', clientType: 'retail' },
  { id: '4', name: 'Maicon Pereira', protocol: '1028', subject: 'Solicitação de consultor', category: 'Comercial', status: 'closed', priority: 'medium', date: '05/05/2025', time: '16:45', description: 'Gostaria de falar com um consultor para renegociar meu plano.', clientType: 'retail' },
];

export const ticketService = {
  getMyTickets: async (): Promise<Ticket[]> => {
    // return apiGet<Ticket[]>('/tickets');  ← descomente quando tiver backend
    return Promise.resolve(MOCK_TICKETS);
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
    MOCK_TICKETS.unshift(newTicket); // aparece no topo da lista
    return Promise.resolve(newTicket);
  },
};