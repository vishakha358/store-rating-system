import { z } from 'zod';

// Password rule: 8-16 characters, must include at least one uppercase letter and one special character.
const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,16}$/;

export const nameValidation = z
  .string()
  .trim()
  .min(20, { message: 'Name must be at least 20 characters long' })
  .max(60, { message: 'Name cannot exceed 60 characters' });

export const addressValidation = z
  .string()
  .trim()
  .min(1, { message: 'Address is required' })
  .max(400, { message: 'Address cannot exceed 400 characters' });

export const emailValidation = z
  .string()
  .trim()
  .email({ message: 'Must be a valid email address' })
  .toLowerCase();

export const passwordValidation = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(16, { message: 'Password cannot exceed 16 characters' })
  .regex(passwordRegex, {
    message: 'Password must include at least one uppercase letter and one special character',
  });

export const roleValidation = z.enum(['ADMIN', 'USER', 'STORE_OWNER'], {
  errorMap: () => ({ message: 'Role must be ADMIN, USER, or STORE_OWNER' }),
});

export const registerSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  address: addressValidation,
  password: passwordValidation,
});

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, { message: 'Password is required' }),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: passwordValidation,
});

export const adminCreateUserSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  address: addressValidation,
  password: passwordValidation,
  role: roleValidation,
});

export const adminCreateStoreSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  address: addressValidation,
  ownerId: z.string().uuid().optional().nullable().or(z.literal('')),
});

export const submitRatingSchema = z.object({
  rating: z
    .number({ invalid_type_error: 'Rating must be a number' })
    .int({ message: 'Rating must be an integer' })
    .min(1, { message: 'Rating must be between 1 and 5' })
    .max(5, { message: 'Rating must be between 1 and 5' }),
});
