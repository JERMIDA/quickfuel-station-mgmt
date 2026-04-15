import { useNotificationStore } from "@/src/store/notificationStore";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();
  const { t } = useTranslation();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("Notifications")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("Stay updated with your reservations and station alerts.")}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="gap-2">
            <Check size={16} />
            <span className="hidden sm:inline">{t("Mark all as read")}</span>
          </Button>
        )}
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Bell size={32} className="opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">{t("No notifications yet")}</h3>
              <p className="text-sm">{t("When you get updates, they'll show up here.")}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 sm:p-6 flex gap-4 group transition-colors cursor-pointer ${notif.read ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-amber-50/30 dark:bg-amber-900/10'}`}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${notif.read ? 'bg-transparent' : 'bg-amber-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1 sm:gap-4">
                      <h4 className={`text-base font-semibold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {notif.message}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all self-center sm:self-start"
                    title={t("Delete notification")}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
