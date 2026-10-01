export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,16}$/;

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateName = (name: string): ValidationResult => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Name is required' };
  }
  if (trimmed.length < 20) {
    return {
      isValid: false,
      message: `Name must be at least 20 characters (currently ${trimmed.length})`,
    };
  }
  if (trimmed.length > 60) {
    return {
      isValid: false,
      message: `Name cannot exceed 60 characters (currently ${trimmed.length})`,
    };
  }
  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Email address is required' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validateAddress = (address: string): ValidationResult => {
  const trimmed = address.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Address is required' };
  }
  if (trimmed.length > 400) {
    return {
      isValid: false,
      message: `Address cannot exceed 400 characters (currently ${trimmed.length})`,
    };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8 || password.length > 16) {
    return {
      isValid: false,
      message: 'Password must be between 8 and 16 characters long',
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must include at least one uppercase letter',
    };
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must include at least one special character',
    };
  }
  return { isValid: true };
};
