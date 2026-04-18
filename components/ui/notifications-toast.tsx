"use client";

import { Bell, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";

interface NotificationItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

export function NotificationsToast() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (notification: Omit<NotificationItem, "id">) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Global event listener for notifications
    const handleNotification = (event: CustomEvent<NotificationItem>) => {
      addNotification(event.detail);
    };

    window.addEventListener('notification', handleNotification as EventListener);
    return () => window.removeEventListener('notification', handleNotification as EventListener);
  }, []);

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[320px] max-w-md animate-in slide-in-from-right"
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{notification.title}</h4>
              {notification.message && (
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook for showing notifications
export function useNotification() {
  const showNotification = (notification: Omit<NotificationItem, "id">) => {
    window.dispatchEvent(new CustomEvent('notification', { detail: notification }));
  };

  return {
    success: (title: string, message?: string) =>
      showNotification({ type: "success", title, message }),
    error: (title: string, message?: string) =>
      showNotification({ type: "error", title, message }),
    info: (title: string, message?: string) =>
      showNotification({ type: "info", title, message }),
    warning: (title: string, message?: string) =>
      showNotification({ type: "warning", title, message }),
  };
}
