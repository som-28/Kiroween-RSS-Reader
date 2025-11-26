import { create } from 'zustand';
import { ToastType, ToastProps } from '../components/toast/Toast';

interface ToastState {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Convenience hook with helper methods
export const useToast = () => {
  const { addToast, removeToast, clearAll, toasts } = useToastStore();

  const toast = {
    success: (message: string, description?: string, duration?: number) => {
      return addToast({ type: 'success', message, description, duration });
    },

    error: (message: string, description?: string, duration?: number) => {
      return addToast({ type: 'error', message, description, duration });
    },

    warning: (message: string, description?: string, duration?: number) => {
      return addToast({ type: 'warning', message, description, duration });
    },

    info: (message: string, description?: string, duration?: number) => {
      return addToast({ type: 'info', message, description, duration });
    },

    custom: (type: ToastType, message: string, description?: string, duration?: number) => {
      return addToast({ type, message, description, duration });
    },

    remove: removeToast,
    clearAll,
  };

  return { toast, toasts };
};
