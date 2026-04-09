import { useState, useEffect } from "react";
import { Download, TrendingUp, Layers, CheckCircle } from "lucide-react";
import { fetchMarksByStudent } from "../api/mockApi";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

const gradePoints = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "D": 1.0,
  "F": 0.0
};

function scoreToPoints(score, total) {
  if (!total || total <= 0) return 0;
  const ratio = score / total;
  if (ratio >= 0.9) return 4.0;
  if (ratio >= 0.8) return 3.3;
  if (ratio >= 0.7) return 3.0;
  if (ratio >= 0.6) return 2.3;
  if (ratio >= 0.5) return 2.0;
  return 0.0;
}

export default function CGPA() {
  const { user } = useAuth();
  const [data, setData] = useState({ cgpa: 0, totalCredits: 0, completedCredits: 0, marks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user?.role !== "Student") {
          if (!cancelled) setData({ cgpa: 0, totalCredits: 0, completedCredits: 0, marks: [] });
          return;
        }

        const marks = await fetchMarksByStudent(user.id);
        const normalized = (marks || []).map((mark) => {
          const grade = mark.grade ? mark.grade.toUpperCase() : "";
          const points = gradePoints[grade] ?? scoreToPoints(mark.score, mark.total);
          return { ...mark, grade: grade || "-", points };
        });

        const totalPoints = normalized.reduce((sum, mark) => sum + mark.points, 0);
        const cgpa = normalized.length ? totalPoints / normalized.length : 0;
        const uniqueCourses = new Set(normalized.map((mark) => mark.courseName).filter(Boolean));
        const completedCredits = uniqueCourses.size * 3;
        const totalCredits = completedCredits;

        if (!cancelled) {
          setData({ cgpa, totalCredits, completedCredits, marks: normalized });
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load CGPA");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (user) load();
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const cgpa = data?.cgpa ?? 0;
  const totalCredits = data?.totalCredits ?? 0;
  const completedCredits = data?.completedCredits ?? 0;
  const marks = data?.marks ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">CGPA & Transcripts</h1>
          <p className="text-slate-400 mt-1">View your cumulative grade point average and academic performance</p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>Download Transcript</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* BIG CGPA CARD */}
        <div className="md:col-span-1 bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-lg relative overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 opacity-50 z-0 pointer-events-none"></div>
            
            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider z-10">Cumulative GPA</h2>
            <div className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 mb-6 z-10 tracking-tighter">
              {cgpa.toFixed(2)}
            </div>
            
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2 z-10">
               <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full" style={{ width: `${(cgpa / 4.0) * 100}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 z-10 font-medium">
              {marks.length ? `Based on ${marks.length} graded items` : "No grades assigned yet"}
            </p>
        </div>

        {/* STATS CARDS */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col justify-center gap-4 hover-lift">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                     <CheckCircle className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Completed Credits</p>
               </div>
               <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white leading-none">{completedCredits}</p>
                  <span className="text-slate-500 text-sm font-medium">/ {totalCredits}</span>
               </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col justify-center gap-4 hover-lift">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20 shrink-0">
                     <Layers className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Total Degree Credits</p>
               </div>
               <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white leading-none">{totalCredits}</p>
                  <span className="text-slate-500 text-sm font-medium">required</span>
               </div>
            </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-0 sm:p-6 border border-slate-700 shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 sm:p-0 border-b border-slate-700/50 pb-4 mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <TrendingUp className="text-indigo-400 w-5 h-5"/>
            Course Performance
          </h2>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Course</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Exam</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Grade</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {marks.map((mark) => (
                <tr key={mark.id} className="group hover:bg-slate-700/50 hover:scale-[1.01] transition-all duration-200">
                  <td className="py-4 px-6 sm:px-4 font-semibold text-slate-200 whitespace-nowrap">
                     {mark.courseName}
                  </td>
                  <td className="py-4 px-6 sm:px-4 text-slate-300 whitespace-nowrap">
                     {mark.examName}
                  </td>
                  <td className="py-4 px-6 sm:px-4 whitespace-nowrap">
                     <span className="text-lg font-bold text-indigo-400">{mark.grade}</span>
                  </td>
                  <td className="py-4 px-6 sm:px-4 text-right">
                     <span className="text-slate-300 font-medium bg-slate-700/50 px-3 py-1.5 rounded-md border border-slate-600/50 tracking-wide">
                        {mark.score}/{mark.total}
                     </span>
                  </td>
                </tr>
              ))}
              {marks.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-10 text-center text-slate-500 italic">No grades assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
