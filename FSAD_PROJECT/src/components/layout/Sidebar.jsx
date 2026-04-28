import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  Library, 
  Award, 
  Calendar, 
  User, 
  Settings,
  Users,
  LineChart
} from "lucide-react";
import { cn } from "../../utils/cn";

const studentNavItems = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/academic-registration", label: "Registration", Icon: FileText },
  { to: "/attendance", label: "Attendance", Icon: CheckSquare },
  { to: "/courses", label: "My Courses", Icon: BookOpen },
  { to: "/exam", label: "Exams", Icon: GraduationCap },
  { to: "/fee-payments", label: "Fees", Icon: CreditCard },
  { to: "/library", label: "Library", Icon: Library },
  { to: "/cgpa", label: "Grades & CGPA", Icon: Award },
  { to: "/timetable", label: "Timetable", Icon: Calendar },
  { to: "/profile", label: "Profile", Icon: User },
];

const teacherNavItems = [
  { to: "/", label: "Educator Dashboard", Icon: LayoutDashboard },
  { to: "/courses", label: "Manage Courses", Icon: BookOpen },
  { to: "/attendance", label: "Mark Attendance", Icon: CheckSquare },
  { to: "/exam", label: "Manage Exams", Icon: GraduationCap },
  { to: "/timetable", label: "My Schedule", Icon: Calendar },
  { to: "/profile", label: "Profile", Icon: User },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar({ open }) {
  const { user } = useAuth();
  
  const navItems = user?.role === "Teacher" ? teacherNavItems : studentNavItems;

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 260 : 80 }}
      className="relative flex flex-col h-screen bg-[#0A0F1D] border-r border-white/5 z-40 shrink-0"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-0 w-full h-48 bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Header / Logo */}
      <div className="h-[70px] flex items-center px-6 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence mode="popLayout">
            {open && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg text-white tracking-tight"
              >
                CampusCore
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
              >
                {({ isActive }) => (
                  <div className={cn(
                    "group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer",
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}>
                    {/* Active Indicator Bar */}
                    {isActive && (
                      <motion.div
                        layoutId="active-sidebar-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-500 rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}

                    <Icon className={cn(
                      "w-5 h-5 shrink-0 transition-transform duration-200", 
                      open ? "mr-3" : "mx-auto",
                      isActive ? "text-indigo-400" : "text-slate-400 group-hover:scale-110 group-hover:text-slate-200"
                    )} />

                    <AnimatePresence mode="popLayout">
                      {open && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="truncate font-medium text-sm overflow-hidden whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state */}
                    {!open && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                        {label}
                      </div>
                    )}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Bottom User Profile Card */}
      <div className="p-4 shrink-0 border-t border-white/5">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div 
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer border border-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || "Demo User"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role || "Student"}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all">
                {user?.name?.charAt(0) || "U"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
