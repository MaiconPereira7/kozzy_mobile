// src/components/common/Badge/Badge.tsx

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../../theme';

type BadgeVariant = 'status' | 'priority';
type StatusType = 'open' | 'inProgress' | 'closed';
type PriorityType = 'high' | 'medium' | 'low';

interface StatusBadgeProps {
  variant: 'status';
  type: StatusType;
  style?: ViewStyle;
}

interface PriorityBadgeProps {
  variant: 'priority';
  type: PriorityType;
  style?: ViewStyle;
}

type BadgeProps = StatusBadgeProps | PriorityBadgeProps;

export const Badge: React.FC<BadgeProps> = ({ variant, type, style }) => {
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      open: {
        color: COLORS.status.open,
        text: 'Aberto',
        bg: COLORS.status.openBg,
      },
      inProgress: {
        color: COLORS.status.inProgress,
        text: 'Em Análise',
        bg: COLORS.status.inProgressBg,
      },
      closed: {
        color: COLORS.status.closed,
        text: 'Concluído',
        bg: COLORS.status.closedBg,
      },
    };
    return configs[status];
  };

  const getPriorityConfig = (priority: PriorityType) => {
    const configs = {
      high: {
        color: COLORS.priority.high,
        text: 'ALTA',
        bg: COLORS.priority.highBg,
      },
      medium: {
        color: COLORS.priority.medium,
        text: 'MÉDIA',
        bg: COLORS.priority.mediumBg,
      },
      low: {
        color: COLORS.priority.low,
        text: 'BAIXA',
        bg: COLORS.priority.lowBg,
      },
    };
    return configs[priority];
  };

  const config =
    variant === 'status'
      ? getStatusConfig(type as StatusType)
      : getPriorityConfig(type as PriorityType);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bg },
        variant === 'priority' && styles.priorityContainer,
        style,
      ]}
    >
      {variant === 'status' && (
        <View style={[styles.dot, { backgroundColor: config.color }]} />
      )}
      <Text
        style={[
          styles.text,
          { color: config.color },
          variant === 'priority' && styles.priorityText,
        ]}
      >
        {config.text}
      </Text>
    </View>
  );
};

// Componentes específicos para facilitar uso
export const StatusBadge: React.FC<Omit<StatusBadgeProps, 'variant'>> = (
  props
) => <Badge variant="status" {...props} />;

export const PriorityBadge: React.FC<Omit<PriorityBadgeProps, 'variant'>> = (
  props
) => <Badge variant="priority" {...props} />;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  priorityContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.sm,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  priorityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
