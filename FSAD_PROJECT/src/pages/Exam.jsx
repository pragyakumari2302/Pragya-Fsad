import { useState, useEffect } from "react";
import { fetchExams } from "../api/mockApi";
import { Book, CheckCircle, CalendarDays, Clock, MapPin, Award, BookOpen, FileText } from "lucide-react";
import html2pdf from "html2pdf.js";
import Loader from "../components/ui/Loader";

export default function Exam() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchExams()
      .then((res) => {
        if (!cancelled) setData(res || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load exams");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const upcoming = data?.upcoming ?? [];
  const results = data?.results ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Exam Section</h1>
          <p className="text-slate-400 mt-1">Upcoming exams and latest results</p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Exam Guidelines</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* UPCOMING EXAMS CARD */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
               <CalendarDays className="text-indigo-400 w-5 h-5"/>
               Upcoming Exams
            </h2>
            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">{upcoming.length} Scheduled</span>
          </div>
          
          <div className="space-y-4">
            {upcoming.map((exam) => (
              <div key={exam.id} className="group hover:bg-slate-700/50 transition-all duration-200 rounded-xl border border-slate-700/50 p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>
                <div className="flex items-start justify-between gap-4 pl-2">
                  <div>
                    <h3 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
                      {exam.course} <span className="text-slate-500">•</span> {exam.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-500" /> {exam.date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500" /> {exam.time}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-500" /> {exam.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="w-3.5 h-3.5" /> 
                      {exam.syllabus}
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-teal-500/20 text-teal-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                    {exam.type}
                  </span>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
               <p className="text-slate-500 text-sm italic py-4">No upcoming exams scheduled.</p>
            )}
          </div>
        </div>

        {/* RECENT RESULTS CARD */}
        <div className="bg-slate-800 rounded-2xl p-0 sm:p-6 border border-slate-700 shadow-lg overflow-hidden flex flex-col">
          <div className="p-6 sm:p-0 border-b border-slate-700/50 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
               <Award className="text-emerald-400 w-5 h-5"/>
               Recent Results
            </h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="table-auto w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-slate-700/50">
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Course</th>
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Exam</th>
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Score</th>
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Grade</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/30">
                  {results.map((row) => (
                     <tr key={row.course + row.exam} className="group hover:bg-slate-700/50 transition-colors duration-200">
                        <td className="py-4 px-4 font-semibold text-slate-200 whitespace-nowrap">
                           {row.course}
                        </td>
                        <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                           {row.exam}
                        </td>
                        <td className="py-4 px-4 font-medium text-white">
                           {row.score}<span className="text-slate-500">/{row.total}</span>
                        </td>
                        <td className="py-4 px-4">
                           <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                              {row.grade}
                           </span>
                        </td>
                     </tr>
                  ))}
                  {results.length === 0 && (
                     <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-500 italic">No recent results.</td>
                     </tr>
                  )}
               </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
