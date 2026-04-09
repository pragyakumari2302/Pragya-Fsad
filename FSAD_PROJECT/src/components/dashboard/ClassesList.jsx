import React from 'react';
import { motion } from 'framer-motion';

export default function ClassesList({ classes = [] }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block" />
          Upcoming Classes
        </h2>
        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">View Schedule</button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {classes.length > 0 ? classes.map((schedule, i) => (
          <motion.div 
            key={i} 
            variants={item}
            className="group flex items-center p-3 sm:p-4 rounded-xl border border-white/5 bg-slate-800/20 hover:bg-slate-800/60 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg cursor-pointer overflow-hidden relative"
          >
            {/* Subtle hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-violet-500/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 pointer-events-none" />

            {/* Time Badge */}
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10 text-xs sm:text-sm font-bold text-indigo-400 w-24 sm:w-28 text-center mr-4 shrink-0 shadow-inner group-hover:border-indigo-500/30 transition-colors">
              {schedule.time}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{schedule.class}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   {schedule.room}
                </p>
              </div>
            </div>

            {/* Instructor Avatar */}
            {schedule.instructor && (
               <div className="hidden sm:flex items-center gap-2 ml-4">
                  <div className="text-right">
                     <p className="text-xs text-slate-400 font-medium">Instructor</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                    {schedule.instructor.charAt(0)}
                  </div>
               </div>
            )}
            
          </motion.div>
        )) : (
          <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
            No upcoming classes today
          </div>
        )}
      </motion.div>
    </div>
  );
}
