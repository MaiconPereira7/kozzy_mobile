import type { Notification } from '../types';

// Notificações de sistema — visíveis a todos
const SYSTEM_NOTIFICATIONS: Notification[] = [
  { id: 'sys1', type: 'system', title: 'Bem-vindo ao Kozzy!', body: 'Seu acesso ao sistema de atendimento foi ativado.', icon: 'information-circle-outline', color: '#3B82F6', time: '2h atrás', read: true },
  { id: 'sys2', type: 'system', title: 'Atualização do sistema', body: 'Nova versão do app disponível com melhorias.', icon: 'rocket-outline', color: '#6366F1', time: '2 dias atrás', read: true },
];

// Notificações de tickets — visíveis apenas para supervisor/admin
const TICKET_NOTIFICATIONS: Notification[] = [];

export const notificationService = {
  // role: 'user' | 'supervisor' | 'admin'
  getAll: async (role?: string): Promise<Notification[]> => {
    const isSupervisor = role === 'supervisor' || role === 'admin';
    const base = [...TICKET_NOTIFICATIONS, ...SYSTEM_NOTIFICATIONS];
    return Promise.resolve(isSupervisor ? base : SYSTEM_NOTIFICATIONS.map(n => ({ ...n })));
  },

  // Chamado quando um ticket é criado — vai para a fila do supervisor
  addTicketNotification: (data: { protocol: string; subject: string; clientName: string }) => {
    TICKET_NOTIFICATIONS.unshift({
      id: Date.now().toString(),
      type: 'ticket_created',
      title: `Novo chamado #${data.protocol}`,
      body: `${data.clientName}: ${data.subject}`,
      icon: 'ticket-outline',
      color: '#E01E26',
      time: 'Agora',
      read: false,
    });
  },
};
