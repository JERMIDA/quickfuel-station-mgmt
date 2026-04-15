import { Outlet } from "react-router-dom";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-600 dark:text-amber-500 tracking-tight">
              QuickFuel
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Fuel locator and reservation system
            </p>
          </div>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}
