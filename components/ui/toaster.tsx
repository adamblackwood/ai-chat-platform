"use client";
// مزود الإشعارات المنبثقة
import * as React from "react";
import { cn } from "@/utils/cn";
import { Toast, ToastTitle, ToastDescription } from "./toast";

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "warning";
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  const context = React.useContext(ToastContext);
  const toast = React.useCallback(
    (props: Omit<ToastItem, "id">) => { context.addToast(props); },
    [context]
  );
  return { toast, toasts: context.toasts, dismiss: context.removeToast };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    const duration = toast.duration || 4000;
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

function Toaster() {
  const { toasts, removeToast } = React.useContext(ToastContext);
  if (toasts.length === 0) return null;

  return (
    <div className={cn("fixed bottom-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 px-4 sm:bottom-6 sm:end-6 sm:start-auto sm:max-w-[380px] sm:px-0")}>
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant} onClose={() => removeToast(toast.id)}>
          <div>
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
        </Toast>
      ))}
    </div>
  );
}

export { Toaster };
