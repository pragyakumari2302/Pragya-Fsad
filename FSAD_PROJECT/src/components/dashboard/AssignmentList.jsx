import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AssignmentList({ assignments = [] }) {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const getStatusConfig = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: Clock };
      case 'submitted':
        return { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: CheckCircle2 };
      default:
        return { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: AlertCircle };
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-violet-500 rounded-full inline-block" />
          Recent Assignments
        </h2>
        <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">View All</button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {assignments.length > 0 ? assignments.map((assignment, i) => {
          const config = getStatusConfig(assignment.status);
          const StatusIcon = config.icon;
          
          return (
            <motion.div 
              key={i} 
              variants={item}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-800/30 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="mb-3 sm:mb-0">
                <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{assignment.title}</p>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-xs font-medium text-slate-400">{assignment.course}</p>
                   <span className="w-1 h-1 rounded-full bg-slate-600" />
                   <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: {assignment.due}
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 {/* Progress Indicator (Fake based on status for visuals) */}
                 {assignment.status.toLowerCase() !== 'graded' && (
                   <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                     <div className={cn("h-full rounded-full transition-all duration-1000", assignment.status.toLowerCase() === 'submitted' ? "w-full bg-emerald-500" : "w-1/3 bg-amber-500")} />
                   </div>
                 )}

                 {/* Status Badge */}
                 <span className={cn(
                   "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border uppercase tracking-wider", 
                   config.color, config.bg, config.border
                 )}>
                   <StatusIcon className="w-3.5 h-3.5" />
                   {assignment.status}
                 </span>
              </div>
            </motion.div>
          )
        }) : (
          <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
            No assignments due
          </div>
        )}
      </motion.div>
    </div>
  );
}
