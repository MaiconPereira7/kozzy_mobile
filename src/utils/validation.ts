// src/utils/validation.ts

interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const validators = {
  /**
   * Valida formato de email
   */
  email: (email: string): ValidationResult => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = regex.test(email.trim());
    
    return {
      valid: isValid,
      message: isValid ? undefined : 'Email inválido',
    };
  },

  /**
   * Valida senha com requisitos mínimos
   */
  password: (password: string): ValidationResult => {
    if (password.length < 6) {
      return {
        valid: false,
        message: 'Senha deve ter no mínimo 6 caracteres',
      };
    }
    
    return { valid: true };
  },

  /**
   * Valida senha forte (opcional para registro)
   */
  strongPassword: (password: string): ValidationResult => {
    if (password.length < 8) {
      return {
        valid: false,
        message: 'Senha deve ter no mínimo 8 caracteres',
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return {
        valid: false,
        message:
          'Senha deve conter letras maiúsculas, minúsculas e números',
      };
    }

    return { valid: true };
  },

  /**
   * Valida campo obrigatório
   */
  required: (value: string, fieldName = 'Campo'): ValidationResult => {
    const isValid = value.trim().length > 0;
    
    return {
      valid: isValid,
      message: isValid ? undefined : `${fieldName} é obrigatório`,
    };
  },

  /**
   * Valida comprimento mínimo
   */
  minLength: (
    value: string,
    min: number,
    fieldName = 'Campo'
  ): ValidationResult => {
    const isValid = value.trim().length >= min;
    
    return {
      valid: isValid,
      message: isValid
        ? undefined
        : `${fieldName} deve ter no mínimo ${min} caracteres`,
    };
  },

  /**
   * Valida comprimento máximo
   */
  maxLength: (
    value: string,
    max: number,
    fieldName = 'Campo'
  ): ValidationResult => {
    const isValid = value.trim().length <= max;
    
    return {
      valid: isValid,
      message: isValid
        ? undefined
        : `${fieldName} deve ter no máximo ${max} caracteres`,
    };
  },

  /**
   * Valida telefone brasileiro
   */
  phone: (phone: string): ValidationResult => {
    const cleaned = phone.replace(/\D/g, '');
    const isValid = cleaned.length === 10 || cleaned.length === 11;
    
    return {
      valid: isValid,
      message: isValid ? undefined : 'Telefone inválido',
    };
  },

  /**
   * Valida CPF
   */
  cpf: (cpf: string): ValidationResult => {
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) {
      return { valid: false, message: 'CPF inválido' };
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleaned)) {
      return { valid: false, message: 'CPF inválido' };
    }

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) {
      return { valid: false, message: 'CPF inválido' };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) {
      return { valid: false, message: 'CPF inválido' };
    }

    return { valid: true };
  },
};

/**
 * Valida múltiplos campos de uma vez
 */
export const validateForm = (
  fields: { [key: string]: string },
  rules: { [key: string]: (value: string) => ValidationResult }
): { valid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  Object.keys(rules).forEach((fieldName) => {
    const value = fields[fieldName] || '';
    const result = rules[fieldName](value);

    if (!result.valid && result.message) {
      errors[fieldName] = result.message;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
