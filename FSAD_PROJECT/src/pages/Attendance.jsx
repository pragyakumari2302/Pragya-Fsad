import { useState, useEffect } from "react";
import { Book, CheckCircle, AlertCircle, Calendar, Users, Save } from "lucide-react";
import { fetchAttendanceByStudent, fetchAttendanceByCourse, fetchCourses, fetchUsers, fetchEnrollmentsByCourse, createAttendance, createBulkAttendance } from "../api/mockApi";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

export default function Attendance() {
   const { user } = useAuth();

   // Student view state
   const [data, setData] = useState({ courses: [], overallPercentage: 0, lastUpdated: "-" });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Teacher view state
   const [courses, setCourses] = useState([]);
   const [selectedCourse, setSelectedCourse] = useState("");
   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
   const [students, setStudents] = useState([]);
   const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: "present"|"absent"|"late" }
   const [saving, setSaving] = useState(false);
   const [toast, setToast] = useState(null);
   const [existingRecords, setExistingRecords] = useState([]);

   const showToast = (msg, type = "success") => {
     setToast({ msg, type });
     setTimeout(() => setToast(null), 3000);
   };

   // ============ STUDENT MODE ============
   useEffect(() => {
      let cancelled = false;
      if (user?.role !== "Student") return;

      const load = async () => {
         setLoading(true);
         setError(null);
         try {
            const [records, courseList] = await Promise.all([
               fetchAttendanceByStudent(user.id),
               fetchCourses()
            ]);

            const courseMap = new Map((courseList || []).map((course) => [course.id, course]));
            const summary = new Map();
            (records || []).forEach((record) => {
               const entry = summary.get(record.courseId) || { courseId: record.courseId, total: 0, present: 0, lastDate: null };
               entry.total += 1;
               if (record.status === "present" || record.status === "late") entry.present += 1;
               if (!entry.lastDate || record.date > entry.lastDate) entry.lastDate = record.date;
               summary.set(record.courseId, entry);
            });

            const coursesData = Array.from(summary.values()).map((entry) => {
               const course = courseMap.get(entry.courseId);
               const percentage = entry.total ? Math.round((entry.present / entry.total) * 100) : 0;
               const status = percentage >= 90 ? "Excellent" : percentage >= 80 ? "Good" : "Warning";
               return { id: entry.courseId, code: course?.code || `COURSE-${entry.courseId}`, name: course?.title || "Course", percentage, status, total: entry.total, present: entry.present };
            });

            const overallPercentage = coursesData.length
               ? Math.round((coursesData.reduce((sum, c) => sum + c.percentage, 0) / coursesData.length) * 10) / 10
               : 0;
            const lastUpdated = (records || []).length
               ? [...records].map((r) => r.date).sort().slice(-1)[0]
               : "-";

            if (!cancelled) setData({ courses: coursesData, overallPercentage, lastUpdated });
         } catch (err) {
            if (!cancelled) setError(err?.message || "Failed to load attendance");
         } finally {
            if (!cancelled) setLoading(false);
         }
      };

      load();
      return () => { cancelled = true; };
   }, [user?.id, user?.role]);

   // ============ TEACHER MODE ============
   useEffect(() => {
      if (user?.role !== "Teacher" && user?.role !== "Admin") return;
      setLoading(true);
      fetchCourses().then(c => {
         setCourses(c || []);
         setLoading(false);
      }).catch(() => setLoading(false));
   }, [user?.role]);

   // Load students for selected course
   useEffect(() => {
      if (!selectedCourse || (user?.role !== "Teacher" && user?.role !== "Admin")) return;
      const load = async () => {
         try {
            const [enrollments, allUsers, courseAttendance] = await Promise.all([
               fetchEnrollmentsByCourse(Number(selectedCourse)),
               fetchUsers(),
               fetchAttendanceByCourse(Number(selectedCourse))
            ]);
            const studentUsers = (allUsers || []).filter(u => u.role === "Student");
            const enrolledIds = new Set((enrollments || []).map(e => e.studentId));
            const enrolledStudents = studentUsers.filter(s => enrolledIds.has(s.id));
            setStudents(enrolledStudents);
            setExistingRecords(courseAttendance || []);

            // Pre-fill attendance for selected date if exists
            const dateRecords = (courseAttendance || []).filter(a => a.date === selectedDate);
            const map = {};
            enrolledStudents.forEach(s => {
               const existing = dateRecords.find(r => r.studentId === s.id);
               map[s.id] = existing ? existing.status : "present";
            });
            setAttendanceMap(map);
         } catch (err) {
            console.error("Failed to load students:", err);
         }
      };
      load();
   }, [selectedCourse, selectedDate, user?.role]);

   const handleSaveAttendance = async () => {
      if (!selectedCourse || !selectedDate) return;
      setSaving(true);
      try {
         const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
            studentId: Number(studentId),
            courseId: Number(selectedCourse),
            date: selectedDate,
            status
         }));
         // Save each record individually (bulk might not exist on backend)
         for (const record of records) {
            await createAttendance(record);
         }
         showToast(`Attendance saved for ${records.length} students!`);
      } catch (err) {
         showToast("Failed to save attendance", "error");
      } finally {
         setSaving(false);
      }
   };

   if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;
   if (error) return <div className="text-red-500 p-4">{error}</div>;

   // ============ TEACHER / ADMIN VIEW ============
   if (user?.role === "Teacher" || user?.role === "Admin") {
      const courseName = courses.find(c => c.id === Number(selectedCourse));
      return (
         <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            {toast && (
               <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl font-semibold text-white shadow-xl ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
                  {toast.msg}
               </div>
            )}

            <div>
               <h1 className="text-2xl font-extrabold text-white tracking-tight">📋 Mark Attendance</h1>
               <p className="text-slate-400 mt-1">Select a course and date to record student attendance</p>
            </div>

            {/* Controls */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-semibold text-slate-400 mb-2">Select Course</label>
                     <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none">
                        <option value="">-- Choose Course --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-400 mb-2">Select Date</label>
                     <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none" />
                  </div>
                  <div className="flex items-end">
                     <button onClick={handleSaveAttendance} disabled={saving || !selectedCourse || students.length === 0}
                        className="w-full px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Attendance"}
                     </button>
                  </div>
               </div>
            </div>

            {/* Student List */}
            {selectedCourse && (
               <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        {courseName?.title || "Course"} — Students ({students.length})
                     </h2>
                     <div className="flex gap-2">
                        <button onClick={() => { const m = {}; students.forEach(s => m[s.id] = "present"); setAttendanceMap(m); }}
                           className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                           Mark All Present
                        </button>
                        <button onClick={() => { const m = {}; students.forEach(s => m[s.id] = "absent"); setAttendanceMap(m); }}
                           className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors">
                           Mark All Absent
                        </button>
                     </div>
                  </div>

                  {students.length === 0 ? (
                     <p className="text-slate-500 text-center py-8 italic">No students enrolled in this course.</p>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="border-b border-slate-700/50">
                                 <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Student</th>
                                 <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Email</th>
                                 <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Section</th>
                                 <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-center">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-700/30">
                              {students.map(s => (
                                 <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                                    <td className="py-3 px-4 text-slate-400 text-sm">{s.email}</td>
                                    <td className="py-3 px-4 text-slate-400 text-sm">{s.section || "-"}</td>
                                    <td className="py-3 px-4">
                                       <div className="flex justify-center gap-2">
                                          {["present", "absent", "late"].map(status => (
                                             <button key={status} onClick={() => setAttendanceMap(prev => ({ ...prev, [s.id]: status }))}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                                                   attendanceMap[s.id] === status
                                                      ? status === "present" ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25"
                                                        : status === "absent" ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25"
                                                        : "bg-yellow-500 text-slate-900 border-yellow-500 shadow-lg shadow-yellow-500/25"
                                                      : "bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-600"
                                                }`}>
                                                {status}
                                             </button>
                                          ))}
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            )}
         </div>
      );
   }

   // ============ STUDENT VIEW ============
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
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Attendance</h1>
          <p className="text-slate-400 mt-1">Monitor your class attendance across all courses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* OVERALL ATTENDANCE CARD */}
         <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col justify-center items-center text-center">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Overall Attendance</h2>
            <div className="relative w-32 h-32 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-700" stroke="currentColor" strokeWidth="3.5" fill="none"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-indigo-500" stroke="currentColor" strokeWidth="3.5" strokeDasharray="100, 100"
                     style={{ strokeDashoffset: 100 - data?.overallPercentage }} strokeLinecap="round" fill="none"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
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
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Classes</th>
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Attendance</th>
                     <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/30">
                  {data?.courses.map((course) => (
                     <tr key={course.id} className="group hover:bg-slate-700/50 transition-all duration-200">
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
                     <td className="py-4 px-4 text-slate-300 text-sm">{course.present}/{course.total}</td>
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
                        <td colSpan={4} className="py-10 text-center text-slate-500 italic">No attendance records assigned yet.</td>
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
