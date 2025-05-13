import { createStore } from 'zustand/vanilla';
import { devtools, persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timeout?: number;
}

export interface UIState {
  isLoading: boolean;
  notifications: Notification[];
  theme: 'light' | 'dark';
  setLoading: (isLoading: boolean) => void;
  addNotification: (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    timeout?: number
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  resetStore: () => void;
}

const initialState = {
  isLoading: false,
  notifications: [],
  theme: 'light' as 'light' | 'dark',
};

// Use createStore for vanilla JS
export const uiStore = createStore<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setLoading: (isLoading) => set({ isLoading }),
        addNotification: (type, message, timeout = 5000) => {
          const id = crypto.randomUUID();
          set((state) => ({
            notifications: [
              ...state.notifications,
              { id, type, message, timeout },
            ],
          }));
          if (timeout > 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, timeout);
          }
          return id;
        },
        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
        clearNotifications: () => set({ notifications: [] }),
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light',
          })),
        setTheme: (theme) => set({ theme }),
        resetStore: () => set(initialState),
      }),
      {
        name: 'ui-store', // name of the item in the storage (must be unique)
      }
    )
  )
);

// Export actions directly for easier use
export const {
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleTheme,
  setTheme,
  resetStore,
} = uiStore.getState();

export function getState(): UIState {
  return uiStore.getState();
}

export function subscribeToStore(
  callback: (state: UIState) => void
): () => void {
  return uiStore.subscribe(callback);
}

export function createNotificationsContainer(parent: HTMLElement): HTMLElement {
  const container = document.createElement('div');
  container.className =
    'notifications-container fixed top-4 right-4 z-50 flex flex-col gap-2';
  parent.append(container);

  uiStore.subscribe((state) => {
    container.innerHTML = '';

    for (const notification of state.notifications) {
      const notificationElement = document.createElement('div');

      let typeClasses = '';
      switch (notification.type) {
        case 'success': {
          typeClasses = 'bg-green-100 border-green-500 text-green-700';
          break;
        }
        case 'error': {
          typeClasses = 'bg-red-100 border-red-500 text-red-700';
          break;
        }
        case 'warning': {
          typeClasses = 'bg-yellow-100 border-yellow-500 text-yellow-700';
          break;
        }
        case 'info': {
          typeClasses = 'bg-blue-100 border-blue-500 text-blue-700';
          break;
        }
      }

      notificationElement.className = `notification p-3 rounded border-l-4 ${typeClasses} flex justify-between items-center`;

      const messageSpan = document.createElement('span');
      messageSpan.textContent = notification.message;
      notificationElement.append(messageSpan);

      const closeButton = document.createElement('button');
      closeButton.innerHTML = '&times;';
      closeButton.className = 'ml-2 font-bold';
      closeButton.addEventListener('click', () => {
        uiStore.getState().removeNotification(notification.id);
      });
      notificationElement.append(closeButton);

      container.append(notificationElement);
    }
  });

  return container;
}

export function createLoadingIndicator(parent: HTMLElement): HTMLElement {
  const loadingContainer = document.createElement('div');
  loadingContainer.className =
    'loading-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';

  const spinner = document.createElement('div');
  spinner.className =
    'spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin';
  loadingContainer.append(spinner);

  parent.append(loadingContainer);

  uiStore.subscribe((state) => {
    if (state.isLoading) {
      loadingContainer.classList.remove('hidden');
    } else {
      loadingContainer.classList.add('hidden');
    }
  });

  return loadingContainer;
}
