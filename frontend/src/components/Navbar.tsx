import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Fuel, LogOut, User, Globe, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/src/components/ThemeToggle';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="bg-amber-600 p-1.5 rounded-lg">
            <Fuel className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-amber-950 dark:text-amber-500">{t("QuickFuel")}</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-400">
          <a href="/#features" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">{t("Features")}</a>
          <a href="/#how-it-works" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">{t("How it Works")}</a>
          <a href="/#stations" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">{t("For Stations")}</a>
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={toggleLanguage}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center gap-1 text-sm font-medium"
            title="Switch Language"
          >
            <Globe size={18} />
            {getLangLabel()}
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="hidden sm:inline-flex items-center gap-2">
                  <User size={18} />
                  {t("Dashboard")}
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut size={18} />
                <span className="hidden sm:inline">{t("Logout")}</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">{t("Log in")}</Button>
              </Link>
              <Link to="/register">
                <Button>{t("Get Started")}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={toggleLanguage}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center gap-1 text-sm font-medium"
            title="Switch Language"
          >
            <Globe size={18} />
            {getLangLabel()}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 absolute top-16 left-0 w-full shadow-lg">
          <div className="flex flex-col p-4 space-y-4">
            <a href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-400 font-medium hover:text-amber-600 dark:hover:text-amber-500 transition-colors">{t("Features")}</a>
            <a href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-400 font-medium hover:text-amber-600 dark:hover:text-amber-500 transition-colors">{t("How it Works")}</a>
            <a href="/#stations" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-400 font-medium hover:text-amber-600 dark:hover:text-amber-500 transition-colors">{t("For Stations")}</a>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center gap-2">
                      <User size={18} />
                      {t("Dashboard")}
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full justify-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={18} />
                    {t("Logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">{t("Log in")}</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full justify-center">{t("Get Started")}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
