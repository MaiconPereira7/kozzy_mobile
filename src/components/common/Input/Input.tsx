// src/components/common/Input/Input.tsx

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING } from '../../../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  icon?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  showPasswordToggle?: boolean;
  error?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  showPasswordToggle = false,
  error = false,
  disabled = false,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View
      style={[
        styles.container,
        disabled && styles.containerDisabled,
        error && styles.containerError,
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={disabled ? COLORS.text.light : COLORS.text.secondary}
          style={styles.icon}
        />
      )}

      <TextInput
        style={[
          styles.input,
          disabled && styles.inputDisabled,
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.input.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable && !disabled}
        {...rest}
      />

      {showPasswordToggle && secureTextEntry && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input.background,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.base,
  },
  containerDisabled: {
    backgroundColor: COLORS.input.backgroundDisabled,
    borderColor: 'transparent',
  },
  containerError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  icon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  inputDisabled: {
    color: COLORS.text.light,
  },
  iconButton: {
    padding: SPACING.sm,
  },
});
