import { z } from 'zod';
import { ValidationResult } from '../../types/auth';
import { PromoCodeFormData } from './promo-types';

const promoSchema = z
  .string()
  .min(1, 'Enter a promo code')
  .regex(/^[A-Za-z0-9]+$/, 'Only Latin letters (A-Z,a-z) and digits (0-9)');

export function validatePromo(data: PromoCodeFormData): ValidationResult {
  try {
    promoSchema.parse(data.code);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: { code: error.issues[0].message },
      };
    }
    return {
      success: false,
      errors: { code: 'An unexpected error occurred' },
    };
  }
}
