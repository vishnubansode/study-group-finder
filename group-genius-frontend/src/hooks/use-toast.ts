// src/components/ui/use-toast.ts
import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState<any[]>([]);

  const toast = (props: any) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, ...props };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  return {
    toast,
    toasts
  };
}