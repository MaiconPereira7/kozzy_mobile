// src/types/index.ts

// ============= USER TYPES =============
export type UserRole = 'user' | 'supervisor' | 'admin';

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  phone?: string;
  createdAt?: string;
}

// ============= TICKET TYPES =============
export type TicketStatus = 'open' | 'inProgress' | 'closed';
export type TicketPriority = 'high' | 'medium' | 'low';
export type ClientType = 'retail' | 'wholesale' | 'foodService';

export interface Ticket {
  id: string;
  name: string;
  subject: string;
  status: TicketStatus;
  protocol: string;
  clientType: ClientType;
  category: string;
  priority: TicketPriority;
  date: string;
  time: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: string;
}

export interface TicketCreate {
  name: string;
  subject: string;
  clientType: ClientType;
  category: string;
  priority: TicketPriority;
  description: string;
}

export interface TicketUpdate {
  status?: TicketStatus;
  category?: string;
  priority?: TicketPriority;
  assignedTo?: string;
}

// ============= NOTIFICATION TYPES =============
export type NotificationType = 
  | 'ticket_created'
  | 'ticket_updated'
  | 'ticket_closed'
  | 'system'
  | 'reminder';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  icon: string;
  color: string;
  time: string;
  read: boolean;
  data?: any;
}

// ============= AUTH TYPES =============
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token?: string;
  message?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ============= FORM TYPES =============
export interface FormField {
  value: string;
  error?: string;
  touched?: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

// ============= API TYPES =============
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: { [key: string]: string };
}

// ============= UTILITY TYPES =============
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;
