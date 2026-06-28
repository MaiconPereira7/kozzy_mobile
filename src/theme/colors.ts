// src/theme/colors.ts

export const COLORS = {
  primary: '#e60023',
  secondary: '#d9534f',
  background: '#f8f8f8',
  backgroundLight: '#f0f2f5',
  backgroundGradient: ['#f0f2f5', '#e6e9f0'] as const,
  white: '#FFFFFF',
  black: '#000000',
  text: {
    primary: '#333333',
    secondary: '#777777',
    light: '#999999',
    white: '#FFFFFF',
  },
  status: {
    open: '#e60023',
    inProgress: '#f0ad4e',
    closed: '#5cb85c',
    openBg: '#ffebee',
    inProgressBg: '#fff3e0',
    closedBg: '#e8f5e9',
  },
  priority: {
    high: '#d9534f',
    medium: '#f0ad4e',
    low: '#5cb85c',
    highBg: '#fde8e8',
    mediumBg: '#fff7e6',
    lowBg: '#e8f5e9',
  },
  gradients: {
    background: ['#f0f2f5', '#e6e9f0'] as const,
    button: ['#ef6e7c', '#d9534f'] as const,
    primary: ['#e60023', '#d9534f'] as const,
  },
  border: {
    light: '#eee',
    medium: '#e0e0e0',
    dark: '#ccc',
  },
  input: {
    background: '#f9f9f9',
    backgroundDisabled: '#f0f0f0',
    border: '#eee',
    placeholder: '#999',
  },
  card: {
    background: '#FFFFFF',
    shadow: '#000000',
    divider: '#f0f0f0',
  },
  success: '#5cb85c',
  warning: '#f0ad4e',
  error: '#d9534f',
  info: '#2196F3',
} as const;

export const DARK_COLORS = {
  primary: '#e60023',
  secondary: '#d9534f',
  background: '#0F0F0F',
  backgroundLight: '#1A1A1A',
  backgroundGradient: ['#1A1A1A', '#0F0F0F'] as const,
  white: '#1E1E1E',
  black: '#FFFFFF',
  text: {
    primary: '#F0F0F0',
    secondary: '#AAAAAA',
    light: '#666666',
    white: '#FFFFFF',
  },
  status: {
    open: '#e60023',
    inProgress: '#F59E0B',
    closed: '#10B981',
    openBg: '#2D0000',
    inProgressBg: '#2D1A00',
    closedBg: '#002D0A',
  },
  priority: {
    high: '#d9534f',
    medium: '#F59E0B',
    low: '#10B981',
    highBg: '#2D0000',
    mediumBg: '#2D1A00',
    lowBg: '#002D0A',
  },
  gradients: {
    background: ['#1A1A1A', '#0F0F0F'] as const,
    button: ['#ef6e7c', '#d9534f'] as const,
    primary: ['#e60023', '#d9534f'] as const,
  },
  border: {
    light: '#2A2A2A',
    medium: '#333333',
    dark: '#444444',
  },
  input: {
    background: '#252525',
    backgroundDisabled: '#1A1A1A',
    border: '#333333',
    placeholder: '#555555',
  },
  card: {
    background: '#1E1E1E',
    shadow: '#000000',
    divider: '#2A2A2A',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#d9534f',
  info: '#3B82F6',
} as const;

export type Colors = typeof COLORS;
export type ColorKeys = keyof typeof COLORS;
