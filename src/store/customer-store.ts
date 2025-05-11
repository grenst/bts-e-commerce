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
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void; // Allow setting to null
  clearCustomer: () => void;
}

export const useCustomerStore = createStore<CustomerState>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (customer) => set({ customer }),
      clearCustomer: () => set({ customer: null }),
    }),
    {
      name: 'customer-storage', // name of the item in localStorage
    }
  )
);
