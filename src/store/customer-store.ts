import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import type { Address } from '../types/commercetools';

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  age?: string;
  version: number;
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  shippingAddressIds?: string[];
  billingAddressIds?: string[];
}

interface CustomerState {
  customer: Customer | undefined;
  setCustomer: (customer: Customer | undefined) => void;
  clearCustomer: () => void;
}

export const useCustomerStore = createStore<CustomerState>()(
  persist(
    (set) => ({
      customer: undefined,
      setCustomer: (customer) => set({ customer }),
      clearCustomer: () => set({ customer: undefined }),
    }),
    {
      name: 'customer-storage', // key in localStorage
    }
  )
);
