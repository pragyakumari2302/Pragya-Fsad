import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useSidebar } from "../../hooks/useSidebar";

export default function Layout({ children }) {
  const { open, toggle } = useSidebar();

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden text-slate-200">
      <Sidebar open={open} />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Navbar toggle={toggle} sidebarOpen={open} />
        <main className="flex-1 p-6 lg:p-10 overflow-auto custom-scrollbar relative z-10">
          {/* Subtle page background glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
