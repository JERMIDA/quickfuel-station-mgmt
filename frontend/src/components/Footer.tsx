import React from 'react';
import { Fuel } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 dark:bg-black text-slate-400 py-12 mt-auto border-t border-slate-800 dark:border-slate-900">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Fuel className="text-amber-500" size={24} />
            <span className="text-xl font-bold text-white">QuickFuel</span>
          </div>
          <p className="max-w-sm mb-6">
            The smart way to locate, reserve, and pay for fuel. Saving you time and hassle at the pump.
          </p>
        </div>
        <div>
          <h4 className="text-white dark:text-slate-200 font-semibold mb-4">Platform</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white dark:hover:text-amber-400 transition-colors">For Drivers</a></li>
            <li><a href="#" className="hover:text-white dark:hover:text-amber-400 transition-colors">For Stations</a></li>
            <li><a href="#" className="hover:text-white dark:hover:text-amber-400 transition-colors">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white dark:text-slate-200 font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white dark:hover:text-amber-400 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white dark:hover:text-amber-400 transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-white dark:hover:text-amber-400 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 dark:border-slate-900 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
        <p>© 2026 QuickFuel. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-white dark:hover:text-amber-400 transition-colors">Twitter</a>
          <a href="#" className="hover:text-white dark:hover:text-amber-400 transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-white dark:hover:text-amber-400 transition-colors">Facebook</a>
        </div>
      </div>
    </footer>
  );
}
