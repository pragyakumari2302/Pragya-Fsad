import { useState, useEffect } from "react";
import { Book, Layers, CheckCircle, Clock } from "lucide-react";
import Loader from "../components/ui/Loader";
import { useAuth } from "../context/AuthContext";
import { fetchCourses, fetchEnrollmentsByStudent, createEnrollment, deleteEnrollment } from "../api/mockApi";

export default function AcademicRegistration() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        fetchCourses(),
        user?.id ? fetchEnrollmentsByStudent(user.id) : Promise.resolve([])
      ]);
      setCourses(cRes || []);
      setEnrollments(eRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  const handleEnroll = async (courseId) => {
    if (!user?.id) return;
    try {
      await createEnrollment({
        studentId: user.id,
        courseId: courseId,
        enrolledAt: new Date().toISOString().split('T')[0],
        status: "active"
      });
      loadData();
    } catch (err) { console.error("Enroll failed", err); }
  };

  const handleDrop = async (enrollmentId) => {
    try {
      await deleteEnrollment(enrollmentId);
      loadData();
    } catch (err) { console.error("Drop failed", err); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;

  const enrolledCourseIds = enrollments.map(e => e.courseId);
  const enrolledCoursesList = enrollments.map(e => {
    const c = courses.find(course => course.id === e.courseId);
    return c ? { ...c, enrollmentId: e.id, status: e.status } : null;
  }).filter(Boolean);

  const totalCredits = enrolledCoursesList.reduce((sum, c) => sum + c.credits, 0);
  const maxCredits = 20;
  const progressPercentage = (totalCredits / maxCredits) * 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Academic Registration</h1>
          <p className="text-slate-400 mt-1">Manage and view your registered courses</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold text-white mb-6">Your Enrollments</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Course</th>
                <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Credits</th>
                <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {enrolledCoursesList.map((course) => (
                <tr key={course.enrollmentId} className="group hover:bg-slate-700/50 transition-all duration-200">
                  <td className="py-4 px-4 whitespace-nowrap">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400"><Book className="w-4 h-4" /></div>
                        <div><span className="font-semibold text-slate-200">{course.code}</span><p className="text-xs text-slate-400">{course.title}</p></div>
                     </div>
                  </td>
                  <td className="py-4 px-4"><span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">{course.credits} Credits</span></td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => handleDrop(course.enrollmentId)} className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors border border-red-500/20">Drop</button>
                  </td>
                </tr>
              ))}
              {enrolledCoursesList.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-slate-400">No active enrollments.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div>
            <h3 className="text-slate-200 font-semibold mb-1">Semester Progress</h3>
            <p className="text-sm text-slate-400">Total Credits: <span className="text-white font-bold">{totalCredits}</span> / {maxCredits}</p>
         </div>
         <div className="w-full sm:w-1/3">
            <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
               <span>Registration Limit</span><span className="text-indigo-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden border border-slate-700">
               <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
         </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg overflow-hidden mt-8">
        <h2 className="text-xl font-semibold text-white mb-6">Available Courses</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Course</th>
                <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Credits</th>
                <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Instructor</th>
                <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {courses.filter(c => !enrolledCourseIds.includes(c.id)).map((course) => (
                <tr key={course.id} className="group hover:bg-slate-700/50 transition-all duration-200">
                  <td className="py-4 px-4 whitespace-nowrap">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400"><Layers className="w-4 h-4" /></div>
                        <div><span className="font-semibold text-slate-200">{course.code}</span><p className="text-xs text-slate-400">{course.title}</p></div>
                     </div>
                  </td>
                  <td className="py-4 px-4"><span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">{course.credits} Credits</span></td>
                  <td className="py-4 px-4 text-slate-300">{course.instructor}</td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => handleEnroll(course.id)} className="px-3 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-sm transition-colors border border-green-500/20">+ Enroll</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
