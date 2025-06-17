import { z } from 'zod';
import {
  LoginFormData,
  RegisterFormData,
  ValidationResult,
} from '../../types/auth';

const NAME_CITY_REGEX = /^[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)*$/u;

const POSTAL_CODE_PATTERNS: Record<string, RegExp> = {
  US: /^\d{5}(?:-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/,
  GB: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
  NL: /^\d{4}\s?[A-Za-z]{2}$/,
  BE: /^\d{4}$/,
  CH: /^\d{4}$/,
  AT: /^\d{4}$/,
  AU: /^\d{4}$/,
  RU: /^\d{6}$/,
  UA: /^\d{5}$/,
  PL: /^\d{2}-\d{3}$/,
  BY: /^\d{6}$/,
};

export function isPostalCodeValid(code: string, country: string): boolean {
  const cc = country.toUpperCase();
  const pattern = POSTAL_CODE_PATTERNS[cc];
  if (!pattern) return /^[A-Za-z0-9]+(?:[ -]?[A-Za-z0-9]+)*$/.test(code);
  return pattern.test(code);
}

export const emailSchema = z
  .string()
  .min(1, 'Please enter your email')
  .refine((v) => v === v.trim(), 'Email must not start or end with spaces')
  .refine((v) => !/\s/.test(v), 'Email must not contain spaces')
  .refine(
    (v) => z.string().email().safeParse(v).success,
    'Please enter a valid email (e.g., user@example.com)'
  );

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Z]/, 'Add at least one uppercase letter (A-Z)')
  .regex(/[a-z]/, 'Add at least one lowercase letter (a-z)')
  .regex(/[0-9]/, 'Include a number (0-9)')
  .refine((v) => v === v.trim(), 'Password must not start or end with a space');

export const nameSchema = z
  .string()
  .min(3, 'Name is required')
  .regex(NAME_CITY_REGEX, 'Only letters and spaces allowed')
  .max(50, 'Max 50 characters');

export const dateOfBirthSchema = z
  .string()
  .min(1, 'Date of birth is required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
  .refine((date) => {
    const year = Number.parseInt(date.slice(0, 4), 10);
    return year <= new Date().getFullYear() - 18;
  }, 'You must be at least 18 years old')
  .refine((date) => {
    const year = Number.parseInt(date.slice(0, 4), 10);
    return year >= 1900;
  }, 'Date of birth year seems incorrect');

export const streetNameSchema = z
  .string()
  .min(1, 'Street name is required')
  .regex(NAME_CITY_REGEX, 'Only letters and single spaces allowed')
  .max(100, 'Street name must be less than 100 characters');

export const citySchema = z
  .string()
  .min(1, 'City is required')
  .regex(NAME_CITY_REGEX, 'Only letters and spaces allowed')
  .max(50, 'Max 50 characters');

export const basePostalCodeSchema = z
  .string()
  .min(1, 'Postal code is required')
  .refine(
    (v) => v.trim() === v,
    'Postal code must not start or end with a space'
  );

export const postalCodeSchema = basePostalCodeSchema.refine(
  (v) =>
    z
      .string()
      .regex(/^\d{5}$/)
      .safeParse(v).success,
  'Postal code must be 5 digits'
);

export const countrySchema = z
  .string()
  .min(1, 'Country is required')
  .regex(/^[A-Z]{2}$/, 'Country must be a 2-letter ISO code (e.g., US, DE)');

export const houseNumberSchema = z
  .string()
  .min(1, 'House number is required')
  .max(10, 'House number must be ≤ 10 chars')
  .refine((v) => v.trim() === v, 'No leading or trailing spaces');

export const apartmentSchema = z
  .string()
  .max(10, 'Apartment must be ≤ 10 chars')
  .refine((v) => v.trim() === v, 'No leading or trailing spaces')
  .optional();

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    dateOfBirth: dateOfBirthSchema,
    streetName: streetNameSchema,
    houseNumber: houseNumberSchema,
    apartment: apartmentSchema,
    city: citySchema,
    postalCode: basePostalCodeSchema,
    country: countrySchema,
    billingStreetName: streetNameSchema.optional(),
    billingHouseNumber: houseNumberSchema.optional(),
    billingApartment: apartmentSchema.optional(),
    billingCity: citySchema.optional(),
    billingPostalCode: basePostalCodeSchema.optional(),
    billingCountry: countrySchema.optional(),
  })
  .superRefine((data, context) => {
    if (
      typeof data.postalCode === 'string' &&
      typeof data.country === 'string' &&
      !isPostalCodeValid(data.postalCode, data.country)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postalCode'],
        message: 'Invalid postal code for selected country',
      });
    }

    if (data.billingPostalCode) {
      const effectiveCountry = data.billingCountry || data.country;

      if (!effectiveCountry) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['billingCountry'],
          message:
            'Billing country is required when billing postal code is provided',
        });
      } else if (
        typeof data.billingPostalCode === 'string' &&
        typeof effectiveCountry === 'string' &&
        !isPostalCodeValid(data.billingPostalCode, effectiveCountry)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['billingPostalCode'],
          message: 'Invalid billing postal code for selected country',
        });
      }
    }
  });

export function validateLogin(data: LoginFormData): ValidationResult {
  try {
    loginFormSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    const errors: Record<string, string> = {};
    if (error instanceof z.ZodError) {
      for (const error_ of error.errors) {
        if (error_.path.length > 0 && !errors[error_.path[0]]) {
          errors[error_.path[0]] = error_.message;
        }
      }
    }
    return { success: false, errors };
  }
}

export function validateRegister(data: RegisterFormData): ValidationResult {
  try {
    registerFormSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    const errors: Record<string, string> = {};
    if (error instanceof z.ZodError) {
      for (const error_ of error.errors) {
        if (error_.path.length > 0 && !errors[error_.path[0]]) {
          errors[error_.path[0]] = error_.message;
        }
      }
    }
    return { success: false, errors };
  }
}
