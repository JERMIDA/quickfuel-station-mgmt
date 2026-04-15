import { create } from "zustand";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: "1",
      title: "Welcome to QuickFuel",
      message: "Find the nearest station and book fuel easily.",
      type: "info",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: "2",
      title: "Price Update",
      message: "Benzene prices have been updated to 82.50 ETB/L.",
      type: "warning",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    }
  ],
  addNotification: (notif) => set((state) => ({
    notifications: [
      {
        ...notif,
        id: Math.random().toString(36).substring(7),
        read: false,
        createdAt: new Date(),
      },
      ...state.notifications
    ]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));
