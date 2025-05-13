import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  version: number; // Added version to match CommercetoolsCustomer
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
      name: 'customer-storage', // name of the item in localStorage
    }
  )
);
