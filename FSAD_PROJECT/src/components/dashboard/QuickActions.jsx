import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar as CalendarIcon, Upload, CreditCard } from 'lucide-react';

const defaultActions = [
  { id: 1, title: 'Register Course', icon: BookOpen, color: 'from-blue-500 to-sky-400', shadow: 'shadow-blue-500/20', path: '/academic-registration' },
  { id: 2, title: 'View Timetable', icon: CalendarIcon, color: 'from-indigo-500 to-violet-400', shadow: 'shadow-indigo-500/20', path: '/timetable' },
  { id: 3, title: 'Check Exams', icon: Upload, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20', path: '/exam' },
  { id: 4, title: 'Pay Fees', icon: CreditCard, color: 'from-amber-500 to-orange-400', shadow: 'shadow-amber-500/20', path: '/fee-payments' },
];

export default function QuickActions({ actions = defaultActions }) {
  const navigate = useNavigate();
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-sky-500 rounded-full inline-block" />
          Quick Actions
        </h2>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              onClick={() => action.path ? navigate(action.path) : null}
              variants={item}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer"
            >
              {/* Card Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`} />
              
              <div className="relative h-full flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-slate-800/40 hover:bg-slate-800/80 transition-all shadow-lg overflow-hidden">
                {/* Decorative sheen */}
                <div className="absolute top-0 left-0 w-[150%] h-[150%] bg-white/5 -rotate-45 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <span className="text-sm font-semibold text-slate-200 text-center leading-tight">
                  {action.title}
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  );
}
