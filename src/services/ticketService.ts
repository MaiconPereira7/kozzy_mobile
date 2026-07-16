import type { Ticket, TicketCreate, TicketPriority, TicketStatus } from '../types';
import { apiGet, apiPost, apiPatch } from './api';
import { notificationService } from './notificationService';

export const ticketService = {
  getMyTickets: async (clientName?: string): Promise<Ticket[]> => {
    if (!clientName) return [];
    const tickets = await apiGet<Ticket[]>(`/tickets/mine/${encodeURIComponent(clientName)}`);
    return tickets ?? [];
  },

  getAllTickets: async (): Promise<Ticket[]> => {
    const tickets = await apiGet<Ticket[]>('/tickets');
    return tickets ?? [];
  },

  updateTicketStatus: async (id: string, status: TicketStatus): Promise<void> => {
    await apiPatch(`/tickets/${id}/status`, { status });
  },

  updateTicketPriority: async (id: string, priority: TicketPriority): Promise<void> => {
    await apiPatch(`/tickets/${id}/priority`, { priority });
  },

  addResponse: async (id: string, text: string, author: string, authorRole: 'supervisor' | 'admin' | 'user'): Promise<void> => {
    await apiPatch(`/tickets/${id}/response`, { text, author, authorRole });
  },

  rateTicket: async (id: string, stars: number, comment?: string): Promise<void> => {
    await apiPatch(`/tickets/${id}/rate`, { stars, comment });
  },

  createTicket: async (data: TicketCreate): Promise<Ticket> => {
    const ticket = await apiPost<Ticket>('/tickets', data);
    notificationService.addTicketNotification({
      protocol: ticket.protocol,
      subject: ticket.subject,
      clientName: ticket.name,
    });
    return ticket;
  },
};
