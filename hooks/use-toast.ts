"use client";

import * as React from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

type ToastVariant = "default" | "destructive";

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactElement;
  variant?: ToastVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

let listeners: Array<(state: ToastProps[]) => void> = [];
let toastState: ToastProps[] = [];

function dispatch(toasts: ToastProps[]) {
  toastState = toasts;
  listeners.forEach((l) => l(toastState));
}

const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function addToast(props: Omit<ToastProps, "id">) {
  const id = Math.random().toString(36).slice(2);
  dispatch([...toastState, { id, open: true, ...props }].slice(-TOAST_LIMIT));

  const timeout = setTimeout(() => {
    dispatch(toastState.map((t) => (t.id === id ? { ...t, open: false } : t)));
    setTimeout(() => dispatch(toastState.filter((t) => t.id !== id)), 300);
  }, TOAST_REMOVE_DELAY);

  timeouts.set(id, timeout);
  return id;
}

export function toast(props: Omit<ToastProps, "id">) {
  return addToast(props);
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>(toastState);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return { toasts, toast };
}
