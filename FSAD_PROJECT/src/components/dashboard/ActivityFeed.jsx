import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, Calendar, FileText, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const defaultActivities = [
  { id: 1, type: 'assignment', title: 'Submitted Physics Lab Report', time: '2 hours ago', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 2, type: 'attendance', title: 'Attendance marked present for Mathematics IV', time: '4 hours ago', icon: CheckCircle2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 3, type: 'grade', title: 'New grade posted for Data Structures', time: 'Yesterday', icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 4, type: 'system', title: 'Registered for Fall Semester 2026', time: '2 days ago', icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-400/10' },
];

export default function ActivityFeed({ activities = defaultActivities }) {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
  };

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block" />
          Recent Activity
        </h2>
        <button className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative flex-1"
      >
        {/* Continuous Timeline Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-slate-700 via-slate-700 to-transparent" />

        <div className="space-y-6">
          {activities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <motion.div 
                key={activity.id} 
                variants={item}
                className="relative flex items-start gap-4 group cursor-pointer"
              >
                {/* Timeline Dot / Icon */}
                <div className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-slate-700/50 shadow-sm transition-transform duration-300 group-hover:scale-110",
                  activity.bg, activity.color
                )}>
                  {Icon && <Icon className="w-4 h-4" />}
                  
                  {/* Subtle ping animation for the newest item */}
                  {i === 0 && (
                     <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 mt-0.5 group-hover:translate-x-1 transition-transform duration-300">
                  <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
      
      {/* Decorative fade effect at bottom of list */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1E293B] to-transparent pointer-events-none rounded-b-2xl opacity-60" />
    </div>
  );
}
