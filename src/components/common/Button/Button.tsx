// src/components/common/Button/Button.tsx

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </>
  );

  const getTextColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return isDisabled ? COLORS.text.light : COLORS.primary;
    }
    return COLORS.text.white;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: getTextColor(),
      fontWeight: TYPOGRAPHY.weights.bold,
    };

    switch (size) {
      case 'small':
        return { ...baseStyle, fontSize: TYPOGRAPHY.sizes.sm };
      case 'large':
        return { ...baseStyle, fontSize: TYPOGRAPHY.sizes.xl };
      default:
        return { ...baseStyle, fontSize: TYPOGRAPHY.sizes.lg };
    }
  };

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [
      styles.button,
      styles[`button_${size}`],
      fullWidth && styles.fullWidth,
    ];

    if (isDisabled) {
      baseStyles.push(styles.disabled);
    }

    return baseStyles;
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.container, fullWidth && styles.fullWidth, style]}
        activeOpacity={0.8}
        {...rest}
      >
        <LinearGradient
          colors={isDisabled ? ['#ccc', '#aaa'] : COLORS.gradients.button}
          style={getButtonStyle()}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.container,
        getButtonStyle(),
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        style,
      ]}
      activeOpacity={0.7}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  button_small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
  },
  button_medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  button_large: {
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    textAlign: 'center',
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
});
