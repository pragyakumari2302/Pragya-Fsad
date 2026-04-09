import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function StatCard({ 
  title, 
  value, 
  trend, 
  trendUp = true, 
  Icon, 
  iconColor = "text-indigo-400",
  iconBg = "bg-indigo-500/10",
  delay = 0,
  progress
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover-lift cursor-pointer"
    >
      {/* Background gradient flare on hover */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-violet-500/0 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5", iconBg, iconColor)}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border",
            trendUp 
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
              : "text-rose-400 bg-rose-500/10 border-rose-500/20"
          )}>
            {trendUp ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {trend}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-slate-400 font-medium text-sm mb-1">{title}</h3>
        
        {progress !== undefined ? (
           <div className="flex items-center gap-4 mt-2">
              <div className="relative w-14 h-14">
                 <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                       className="text-slate-800"
                       stroke="currentColor"
                       strokeWidth="3.5"
                       fill="none"
                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <motion.path
                       className={iconColor}
                       stroke="currentColor"
                       strokeWidth="3.5"
                       strokeDasharray="100, 100"
                       initial={{ strokeDashoffset: 100 }}
                       animate={{ strokeDashoffset: 100 - progress }}
                       transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
                       strokeLinecap="round"
                       fill="none"
                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                 </svg>
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.8 }}
                    className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white"
                 >
                    {progress}%
                 </motion.div>
              </div>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className="text-3xl font-bold text-white tracking-tight"
              >
                {value}
              </motion.div>
           </div>
        ) : (
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5, delay: delay + 0.2 }}
             className="text-3xl font-bold text-white tracking-tight"
           >
             {value}
           </motion.div>
        )}
      </div>

    </motion.div>
  );
}
