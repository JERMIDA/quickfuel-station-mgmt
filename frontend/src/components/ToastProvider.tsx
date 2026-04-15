import { useEffect, useState } from "react";
import { useNotificationStore, AppNotification } from "@/src/store/notificationStore";
import { X, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function ToastProvider() {
  const { notifications, markAsRead } = useNotificationStore();
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);

  useEffect(() => {
    // Find unread notifications that are newer than 5 seconds ago to show as toasts
    const now = new Date().getTime();
    const newToasts = notifications.filter(
      n => !n.read && (now - new Date(n.createdAt).getTime() < 5000)
    );
    
    // Only add toasts that aren't already active
    const toastsToAdd = newToasts.filter(nt => !activeToasts.find(at => at.id === nt.id));
    
    if (toastsToAdd.length > 0) {
      setActiveToasts(prev => [...prev, ...toastsToAdd]);
      
      // Auto dismiss after 5 seconds
      toastsToAdd.forEach(toast => {
        setTimeout(() => {
          dismissToast(toast.id);
        }, 5000);
      });
    }
  }, [notifications]);

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
    markAsRead(id);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} className="text-amber-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-amber-500" />;
      case 'error': return <XCircle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {activeToasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-4 flex gap-3 items-start"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(toast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{toast.message}</p>
            </div>
            <button 
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
