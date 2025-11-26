import { ReactNode } from 'react';
import { ToastContainer } from './ToastContainer';
import { useToast } from '../../hooks/useToast';

interface ToastProviderProps {
  children: ReactNode;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

export const ToastProvider = ({ children, position = 'top-right' }: ToastProviderProps) => {
  const { toasts, toast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={toast.remove} position={position} />
    </>
  );
};
