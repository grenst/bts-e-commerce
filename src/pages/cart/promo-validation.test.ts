import { validatePromo } from './promo-validation';

describe('validatePromo', () => {
  it('should return success for a valid promo code', () => {
    const data = { code: 'PROMO123' };
    const result = validatePromo(data);
    expect(result.success).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should return an error for an empty promo code', () => {
    const data = { code: '' };
    const result = validatePromo(data);
    expect(result.success).toBe(false);
    expect(result.errors).toEqual({ code: 'Enter a promo code' });
  });

  it('should return an error for a promo code with invalid characters', () => {
    const data = { code: 'PROMO-123' };
    const result = validatePromo(data);
    expect(result.success).toBe(false);
    expect(result.errors).toEqual({
      code: 'Only Latin letters (A-Z,a-z) and digits (0-9)',
    });
  });

  it('should return an error for a promo code with special characters', () => {
    const data = { code: 'PROMO!@#' };
    const result = validatePromo(data);
    expect(result.success).toBe(false);
    expect(result.errors).toEqual({
      code: 'Only Latin letters (A-Z,a-z) and digits (0-9)',
    });
  });
});
