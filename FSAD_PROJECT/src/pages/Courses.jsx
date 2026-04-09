import { useState, useEffect } from "react";
import { Book, Layers, CheckCircle, Clock, BookOpen, User, MapPin, CalendarDays, Users, AlertCircle } from "lucide-react";
import { fetchCourses, fetchEnrollmentsByStudent } from "../api/mockApi";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

export default function Courses() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const courses = await fetchCourses();
        if (user?.role === "Student") {
          const enrollments = await fetchEnrollmentsByStudent(user.id);
          const enrolledIds = new Set((enrollments || []).map((e) => e.courseId));
          const filtered = (courses || []).filter((course) => enrolledIds.has(course.id));
          if (!cancelled) setData(filtered);
        } else {
          if (!cancelled) setData(courses || []);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load courses");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (user) load();
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const totalCourses = data.length;
  const totalCredits = data.reduce((sum, course) => sum + (course.credits || 0), 0);
  const fullSeats = data.filter((course) => {
    if (!course.seats) return false;
    const [taken, capacity] = course.seats.split("/").map((value) => Number(value));
    return Number.isFinite(taken) && Number.isFinite(capacity) && taken >= capacity;
  }).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400"><CheckCircle className="w-3.5 h-3.5" /> Active</span>;
      case "Completed":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>;
      case "Upcoming":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400"><Clock className="w-3.5 h-3.5" /> Upcoming</span>;
      case "Full":
         return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400"><AlertCircle className="w-3.5 h-3.5" /> Full</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400">{status}</span>;
    }
  };

  const pageTitle = user?.role === "Student" ? "My Courses" : "Courses";
  const pageSubtitle = user?.role === "Student"
    ? "Courses assigned by the admin"
    : "Current semester course catalog";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{pageTitle}</h1>
          <p className="text-slate-400 mt-1">{pageSubtitle}</p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Download Catalog</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-white/5">
               <BookOpen className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Courses</p>
               <p className="text-2xl font-bold text-white leading-none">{totalCourses}</p>
            </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-white/5">
               <Layers className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Credits</p>
               <p className="text-2xl font-bold text-white leading-none">{totalCredits}</p>
            </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center bg-rose-500/10 text-rose-400">
               <Users className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Full Sections</p>
               <p className="text-2xl font-bold text-white leading-none">{fullSeats}</p>
            </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-0 sm:p-6 border border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-3 px-4 pt-4 sm:pt-0 font-semibold text-slate-400 uppercase tracking-wider text-xs">Course</th>
                <th className="pb-3 px-4 pt-4 sm:pt-0 font-semibold text-slate-400 uppercase tracking-wider text-xs">Instructor</th>
                <th className="pb-3 px-4 pt-4 sm:pt-0 font-semibold text-slate-400 uppercase tracking-wider text-xs">Schedule</th>
                <th className="pb-3 px-4 pt-4 sm:pt-0 font-semibold text-slate-400 uppercase tracking-wider text-xs">Room</th>
                <th className="pb-3 px-4 pt-4 sm:pt-0 font-semibold text-slate-400 uppercase tracking-wider text-xs">Seats</th>
                <th className="pb-3 px-4 pt-4 sm:pt-0 font-semibold text-slate-400 uppercase tracking-wider text-xs whitespace-nowrap text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {data.map((course) => (
                <tr key={course.code} className="group hover:bg-slate-700/50 hover:scale-[1.01] transition-all duration-200">
                  <td className="py-4 px-4">
                     <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors mt-0.5 shrink-0">
                           <Book className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="font-semibold text-slate-200">{course.code}</p>
                           <p className="text-xs text-slate-400 line-clamp-1">{course.title}</p>
                           <div className="flex items-center gap-1 mt-1">
                              <Layers className="w-3 h-3 text-indigo-400 opacity-70" />
                              <span className="text-indigo-400 text-xs font-bold">{course.credits} Cr</span>
                           </div>
                        </div>
                     </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                     <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{course.instructor}</span>
                     </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                     <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{course.schedule}</span>
                     </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                     <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{course.room}</span>
                     </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                     <span className="text-sm text-slate-300 font-medium bg-slate-700/50 px-2 py-1 rounded-md border border-slate-600/50 tracking-wide">
                        {course.seats}
                     </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {getStatusBadge(course.status)}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-10 text-center text-slate-500 italic">No courses available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
