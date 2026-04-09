import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Bell, MessageSquare, ChevronDown, User, Settings, Moon, LogOut } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Navbar({ toggle, sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const userName = user?.name || "Guest";
  const userRole = user?.role || "User";

  // Dynamic breadcrumb generation
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumb = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace("-", " ") 
    : `Welcome back, ${userName} 👋`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-[70px] px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 glass-header">
      
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
          <span className="text-slate-400">CampusCore</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200">{breadcrumb}</span>
        </div>
      </div>

      {/* Right side: Actions + Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Search */}
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-64 bg-slate-900/50 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-800 rounded border border-white/5">⌘K</kbd>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors relative">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-[#0F172A]" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-[0_0_10px_rgba(99,102,241,0.3)]">
              {userName.charAt(0)}
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showDropdown && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl py-2 z-50 origin-top-right overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-sm font-semibold text-slate-200">{userName}</p>
                  <p className="text-xs text-slate-500">{userRole}</p>
                </div>
                
                <div className="space-y-1 px-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <User className="w-4 h-4" /> My Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button 
                    onClick={() => {
                      document.documentElement.classList.toggle('light-mode');
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Moon className="w-4 h-4" /> Toggle Light/Dark Mode
                    <div className="ml-auto w-7 h-4 rounded-full bg-indigo-500 relative">
                      <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </button>
                </div>
                
                <div className="mt-2 pt-2 border-t border-white/5 px-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
