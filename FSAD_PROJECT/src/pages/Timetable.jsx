import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Download } from "lucide-react";
import Loader from "../components/ui/Loader";

export default function Timetable() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setTimeout(() => {
      if (!cancelled) {
        setData({
          week: "Week of Feb 24 - Mar 2, 2026",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          timeSlots: [
            "07:30 - 09:30",
            "09:40 - 11:40",
            "11:50 - 13:50",
            "14:00 - 16:00"
          ],
          subjects: {
            CSE201: { title: "Data Structures", room: "CSE Lab 2", color: "from-blue-500/20 to-indigo-500/20 text-indigo-300 border-indigo-500/30" },
            CSE205: { title: "DBMS", room: "Room 214", color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30" },
            CSE209: { title: "Operating Systems", room: "Room 302", color: "from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/30" },
            CSE213: { title: "Networks", room: "Room 108", color: "from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30" },
            CSE217: { title: "Machine Learning", room: "AI Lab", color: "from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/30" },
            CSE221: { title: "Software Eng.", room: "Room 210", color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30" },
            CSE223: { title: "HCI", room: "Design Studio", color: "from-fuchsia-500/20 to-purple-500/20 text-fuchsia-300 border-fuchsia-500/30" },
            CSE225: { title: "Cloud Computing", room: "Room 215", color: "from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30" }
          },
          schedule: {
            Monday: ["CSE221", "CSE201", "CSE205", "CSE209"],
            Tuesday: ["CSE213", "CSE205", "CSE223", "CSE217"],
            Wednesday: ["CSE201", "CSE225", "CSE209", "CSE221"],
            Thursday: ["CSE213", "CSE205", "CSE223", "CSE217"],
            Friday: ["CSE201", "CSE225", "CSE209", "CSE221"],
            Saturday: ["CSE217", "CSE213", "CSE205", "CSE223"]
          }
        });
        setLoading(false);
      }
    }, 500);

    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Timetable</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            {data?.week}
          </p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl p-0 sm:p-6 border border-slate-700 shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 sm:p-0 border-b border-slate-700/50 pb-4 mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="text-indigo-400 w-5 h-5"/>
            Weekly Schedule
          </h2>
          <span className="text-xs text-slate-500">Each slot is 2 hours (10m break)</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-4 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs w-32 border-r border-slate-700/50">Time</th>
                {data?.days.map((day) => (
                  <th key={day} className="pb-4 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-center w-48">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {data?.timeSlots.map((slot, slotIndex) => (
                <tr key={slot} className="group">
                  <td className="py-4 px-4 text-slate-300 font-medium whitespace-nowrap border-r border-slate-700/50">
                    <div className="flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5 text-slate-500"/>
                       {slot}
                    </div>
                  </td>
                  {data?.days.map((day) => {
                    const code = data?.schedule?.[day]?.[slotIndex];
                    const subject = data?.subjects?.[code];
                    
                    return (
                      <td key={`${day}-${slot}`} className="p-2 border-r border-slate-700/30 last:border-r-0">
                        {subject ? (
                           <div className={`h-full rounded-xl p-3 border hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm bg-gradient-to-br ${subject.color}`}>
                             <p className="text-sm font-bold tracking-tight mb-1">{code}</p>
                             <p className="text-xs font-medium opacity-90 line-clamp-1 mb-2" title={subject.title}>{subject.title}</p>
                             <div className="flex items-center gap-1 text-[10px] opacity-75">
                                <MapPin className="w-3 h-3" />
                                {subject.room}
                             </div>
                           </div>
                        ) : (
                           <div className="h-full min-h-[5rem] rounded-xl border border-dashed border-slate-700/50 bg-slate-800/50 flex items-center justify-center opacity-50">
                              <span className="text-xs text-slate-500">Free Slot</span>
                           </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
