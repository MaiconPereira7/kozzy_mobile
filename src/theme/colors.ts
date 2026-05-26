// src/theme/colors.ts

export const COLORS = {
  // Cores principais
  primary: '#e60023',
  secondary: '#d9534f',
  
  // Backgrounds
  background: '#f8f8f8',
  backgroundLight: '#f0f2f5',
  backgroundGradient: ['#f0f2f5', '#e6e9f0'] as const,
  
  // Cores base
  white: '#FFFFFF',
  black: '#000000',
  
  // Textos
  text: {
    primary: '#333333',
    secondary: '#777777',
    light: '#999999',
    white: '#FFFFFF',
  },
  
  // Status dos chamados
  status: {
    open: '#e60023',
    inProgress: '#f0ad4e',
    closed: '#5cb85c',
    openBg: '#ffebee',
    inProgressBg: '#fff3e0',
    closedBg: '#e8f5e9',
  },
  
  // Prioridades
  priority: {
    high: '#d9534f',
    medium: '#f0ad4e',
    low: '#5cb85c',
    highBg: '#fde8e8',
    mediumBg: '#fff7e6',
    lowBg: '#e8f5e9',
  },
  
  // Gradientes
  gradients: {
    background: ['#f0f2f5', '#e6e9f0'] as const,
    button: ['#ef6e7c', '#d9534f'] as const,
    primary: ['#e60023', '#d9534f'] as const,
  },
  
  // Borders
  border: {
    light: '#eee',
    medium: '#e0e0e0',
    dark: '#ccc',
  },
  
  // Inputs
  input: {
    background: '#f9f9f9',
    backgroundDisabled: '#f0f0f0',
    border: '#eee',
    placeholder: '#999',
  },
  
  // Cards
  card: {
    background: '#FFFFFF',
    shadow: '#000000',
    divider: '#f0f0f0',
  },
  
  // Estados
  success: '#5cb85c',
  warning: '#f0ad4e',
  error: '#d9534f',
  info: '#2196F3',
} as const;

export type ColorKeys = keyof typeof COLORS;
