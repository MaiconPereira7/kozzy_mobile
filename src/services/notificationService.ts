// src/services/notificationService.ts
import type { Notification } from '../types';

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'ticket_updated', title: 'Ticket #1042 atualizado', body: 'Seu chamado sobre entrega foi respondido pela equipe.', icon: 'ticket-outline', color: '#E01E26', time: '10 min atrás', read: false },
  { id: '2', type: 'reminder',       title: 'Prazo de entrega próximo', body: 'O pedido #882 vence amanhã. Confirme o recebimento.',  icon: 'warning-outline', color: '#F59E0B', time: '1h atrás', read: false },
  { id: '3', type: 'system',         title: 'Bem-vindo ao Kozzy!', body: 'Seu acesso ao sistema de atendimento foi ativado.',       icon: 'information-circle-outline', color: '#3B82F6', time: '2h atrás', read: true },
  { id: '4', type: 'ticket_closed',  title: 'Ticket #1039 encerrado', body: 'O chamado foi marcado como resolvido.',                 icon: 'checkmark-circle-outline', color: '#10B981', time: 'Ontem', read: true },
  { id: '5', type: 'system',         title: 'Atualização do sistema', body: 'Nova versão do app disponível com melhorias.',         icon: 'rocket-outline', color: '#6366F1', time: '2 dias atrás', read: true },
];

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    return Promise.resolve(MOCK_NOTIFICATIONS);
  },
};