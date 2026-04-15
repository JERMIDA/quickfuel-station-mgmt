import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/src/store/authStore";
import { supabase } from "@/src/lib/supabase";
import { useTranslation } from "react-i18next";
import Footer from "@/src/components/Footer";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import { useNotificationStore } from "@/src/store/notificationStore";
import {
  MapPin,
  Fuel,
  Clock,
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  Menu,
  X,
  Globe,
  Bell
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/utils/cn";

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate("/login");
  };

  const toggleLanguage = () => {
    const langs = ['en', 'am', 'om'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    i18n.changeLanguage(langs[nextIndex]);
  };

  const getLangLabel = () => {
    switch(i18n.language) {
      case 'am': return 'AM';
      case 'om': return 'OM';
      default: return 'EN';
    }
  };

  const getNavItems = () => {
    if (user?.role === "admin") {
      return [
        { name: t("Dashboard"), path: "/admin", icon: LayoutDashboard },
        { name: t("Stations"), path: "/admin/stations", icon: Fuel },
        { name: t("Users"), path: "/admin/users", icon: Users },
        { name: t("Reports"), path: "/admin/reports", icon: Clock },
        { name: t("Notifications"), path: "/notifications", icon: Bell, badge: unreadCount },
      ];
    }
    if (user?.role === "operator") {
      return [
        { name: t("Overview"), path: "/operator", icon: LayoutDashboard },
        { name: t("Queue"), path: "/operator/queue", icon: Clock },
        { name: t("Reservations"), path: "/operator/reservations", icon: Fuel },
        { name: t("Notifications"), path: "/notifications", icon: Bell, badge: unreadCount },
      ];
    }
    // Driver
    return [
      { name: t("Dashboard"), path: "/dashboard", icon: LayoutDashboard },
      { name: t("Stations"), path: "/stations", icon: Fuel },
      { name: t("My Reservations"), path: "/reservations", icon: Clock },
      { name: t("Notifications"), path: "/notifications", icon: Bell, badge: unreadCount },
      { name: t("Profile"), path: "/profile", icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="text-xl font-bold text-amber-600 dark:text-amber-500 hover:opacity-90 transition-opacity">
          {t("QuickFuel")}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleLanguage}
            className="p-2 text-slate-600 dark:text-slate-400 flex items-center gap-1 text-sm font-medium"
          >
            <Globe size={18} />
            {getLangLabel()}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:flex md:flex-col",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="p-6 hidden md:flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-amber-600 dark:text-amber-500 tracking-tight hover:opacity-90 transition-opacity block">
              {t("QuickFuel")}
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={toggleLanguage}
                className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center gap-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"
                title="Switch Language"
              >
                <Globe size={14} />
                {getLangLabel()}
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 pt-20 pb-6 md:py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.name}
                  </div>
                  {item.badge ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={18} />
              {t("Logout")}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="p-4 md:p-8 flex-1">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
