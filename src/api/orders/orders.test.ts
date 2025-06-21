import { orders } from './orders';

describe('orders', () => {
  it('should be a function', () => {
    expect(typeof orders).toBe('function');
  });

  it('should return undefined when called', () => {
    expect(orders()).toBeUndefined();
  });
});
