export interface UIState {
  isLoading: boolean;
  notifications: Notification[];
  theme: 'light' | 'dark';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timeout?: number;
}

const initialState: UIState = {
  isLoading: false,
  notifications: [],
  theme: 'light',
};

let state: UIState = { ...initialState };

type StoreEventType = 'change';
type StoreEventListener = (state: UIState) => void;
const listeners: Record<StoreEventType, StoreEventListener[]> = {
  change: [],
};

export function subscribeToStore(
  event: StoreEventType,
  callback: StoreEventListener
): () => void {
  listeners[event].push(callback);
  return () => {
    const index = listeners[event].indexOf(callback);
    if (index !== -1) {
      listeners[event].splice(index, 1);
    }
  };
}

function notifyListeners(event: StoreEventType): void {
  listeners[event].forEach((callback) => callback({ ...state }));
}

export function getState(): UIState {
  return { ...state };
}

export function setLoading(isLoading: boolean): void {
  state.isLoading = isLoading;
  notifyListeners('change');
}

export function addNotification(
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  timeout = 5000
): string {
  const id = crypto.randomUUID();
  
  state.notifications.push({
    id,
    type,
    message,
    timeout,
  });
  
  notifyListeners('change');
  
  if (timeout > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, timeout);
  }
  
  return id;
}

export function removeNotification(id: string): void {
  state.notifications = state.notifications.filter((n) => n.id !== id);
  notifyListeners('change');
}

export function clearNotifications(): void {
  state.notifications = [];
  notifyListeners('change');
}

export function toggleTheme(): void {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  notifyListeners('change');
}

export function setTheme(theme: 'light' | 'dark'): void {
  state.theme = theme;
  notifyListeners('change');
}

export function resetStore(): void {
  state = { ...initialState };
  notifyListeners('change');
}

export function createNotificationsContainer(parent: HTMLElement): HTMLElement {
  const container = document.createElement('div');
  container.className = 'notifications-container fixed top-4 right-4 z-50 flex flex-col gap-2';
  parent.appendChild(container);
  
  subscribeToStore('change', (state) => {
    container.innerHTML = '';
    
    state.notifications.forEach((notification) => {
      const notificationEl = document.createElement('div');
      
      let typeClasses = '';
      switch (notification.type) {
        case 'success':
          typeClasses = 'bg-green-100 border-green-500 text-green-700';
          break;
        case 'error':
          typeClasses = 'bg-red-100 border-red-500 text-red-700';
          break;
        case 'warning':
          typeClasses = 'bg-yellow-100 border-yellow-500 text-yellow-700';
          break;
        case 'info':
        default:
          typeClasses = 'bg-blue-100 border-blue-500 text-blue-700';
          break;
      }
      
      notificationEl.className = `notification p-3 rounded border-l-4 ${typeClasses} flex justify-between items-center`;
      
      const message = document.createElement('span');
      message.textContent = notification.message;
      notificationEl.appendChild(message);
      
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '&times;';
      closeButton.className = 'ml-2 font-bold';
      closeButton.addEventListener('click', () => {
        removeNotification(notification.id);
      });
      notificationEl.appendChild(closeButton);
      
      container.appendChild(notificationEl);
    });
  });
  
  return container;
}

export function createLoadingIndicator(parent: HTMLElement): HTMLElement {
  const loadingContainer = document.createElement('div');
  loadingContainer.className = 'loading-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
  
  const spinner = document.createElement('div');
  spinner.className = 'spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin';
  loadingContainer.appendChild(spinner);
  
  parent.appendChild(loadingContainer);
  
  subscribeToStore('change', (state) => {
    if (state.isLoading) {
      loadingContainer.classList.remove('hidden');
    } else {
      loadingContainer.classList.add('hidden');
    }
  });
  
  return loadingContainer;
}
