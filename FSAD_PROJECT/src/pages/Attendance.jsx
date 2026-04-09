import { useState, useEffect } from "react";
import { Book, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { fetchAttendanceByStudent, fetchCourses } from "../api/mockApi";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

export default function Attendance() {
   const { user } = useAuth();
   const [data, setData] = useState({ courses: [], overallPercentage: 0, lastUpdated: "-" });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      let cancelled = false;

      const load = async () => {
         setLoading(true);
         setError(null);
         try {
            if (user?.role !== "Student") {
               if (!cancelled) setData({ courses: [], overallPercentage: 0, lastUpdated: "-" });
               return;
            }

            const [records, courses] = await Promise.all([
               fetchAttendanceByStudent(user.id),
               fetchCourses()
            ]);

            const courseMap = new Map((courses || []).map((course) => [course.id, course]));
            const summary = new Map();
            (records || []).forEach((record) => {
               const entry = summary.get(record.courseId) || {
                  courseId: record.courseId,
                  total: 0,
                  present: 0,
                  lastDate: null
               };
               entry.total += 1;
               if (record.status === "present" || record.status === "late") {
                  entry.present += 1;
               }
               if (!entry.lastDate || record.date > entry.lastDate) {
                  entry.lastDate = record.date;
               }
               summary.set(record.courseId, entry);
            });

            const coursesData = Array.from(summary.values()).map((entry) => {
               const course = courseMap.get(entry.courseId);
               const percentage = entry.total ? Math.round((entry.present / entry.total) * 100) : 0;
               const status = percentage >= 90 ? "Excellent" : percentage >= 80 ? "Good" : "Warning";
               return {
                  id: entry.courseId,
                  code: course?.code || `COURSE-${entry.courseId}`,
                  name: course?.title || "Course",
                  percentage,
                  status
               };
            });

            const overallPercentage = coursesData.length
               ? Math.round((coursesData.reduce((sum, course) => sum + course.percentage, 0) / coursesData.length) * 10) / 10
               : 0;
            const lastUpdated = (records || []).length
               ? [...records].map((record) => record.date).sort().slice(-1)[0]
               : "-";

            if (!cancelled) {
               setData({ courses: coursesData, overallPercentage, lastUpdated });
            }
         } catch (err) {
            if (!cancelled) setError(err?.message || "Failed to load attendance");
         } finally {
            if (!cancelled) setLoading(false);
         }
      };

      if (user) load();
      return () => { cancelled = true; };
   }, [user?.id, user?.role]);

   if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;
   if (error) return <div className="text-red-500 p-4">{error}</div>;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Excellent":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400"><CheckCircle className="w-3.5 h-3.5" /> Excellent</span>;
      case "Good":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400"><CheckCircle className="w-3.5 h-3.5" /> Good</span>;
      case "Warning":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400"><AlertCircle className="w-3.5 h-3.5" /> Warning</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Attendance</h1>
          <p className="text-slate-400 mt-1">Monitor your class attendance across all courses</p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>View Timetable</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* OVERALL ATTENDANCE CARD */}
         <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col justify-center items-center text-center">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Overall Attendance</h2>
            <div className="relative w-32 h-32 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                     className="text-slate-700"
                     stroke="currentColor"
                     strokeWidth="3.5"
                     fill="none"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                     className="text-indigo-500"
                     stroke="currentColor"
                     strokeWidth="3.5"
                     strokeDasharray="100, 100"
                     style={{ strokeDashoffset: 100 - data?.overallPercentage }}
                     strokeLinecap="round"
                     fill="none"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white leading-none">{data?.overallPercentage.toFixed(1)}%</span>
               </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Last updated: {data?.lastUpdated}</p>
         </div>

         {/* ATTENDANCE TABLE */}
         <div className="md:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg overflow-hidden">
            <h2 className="text-xl font-semibold text-white mb-6">Attendance by Course</h2>
            <div className="overflow-x-auto">
               <table className="table-auto w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-slate-700/50">
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Course Name</th>
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Attendance</th>
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/30">
                  {data?.courses.map((course) => (
                     <tr key={course.id} className="group hover:bg-slate-700/50 hover:scale-[1.01] transition-all duration-200">
                     <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                              <Book className="w-4 h-4" />
                           </div>
                           <div>
                              <p className="font-semibold text-slate-200">{course.code}</p>
                              <p className="text-xs text-slate-500">{course.name}</p>
                           </div>
                        </div>
                     </td>
                     <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                           <span className="text-white font-bold">{course.percentage}%</span>
                           <div className="hidden sm:block w-24 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${course.percentage >= 90 ? 'bg-green-500' : course.percentage >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                style={{ width: `${course.percentage}%` }}
                              ></div>
                           </div>
                        </div>
                     </td>
                     <td className="py-4 px-4 text-right">
                       {getStatusBadge(course.status)}
                     </td>
                     </tr>
                  ))}
                  {data?.courses.length === 0 && (
                     <tr>
                        <td colSpan={3} className="py-10 text-center text-slate-500 italic">No attendance records assigned yet.</td>
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
