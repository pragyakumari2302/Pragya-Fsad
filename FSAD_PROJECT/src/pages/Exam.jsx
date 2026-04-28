import { useState, useEffect } from "react";
import { fetchExams, fetchCourses, fetchUsers, fetchEnrollmentsByCourse, fetchMarks, fetchMarksByStudent, createMark } from "../api/mockApi";
import { Book, CheckCircle, CalendarDays, Clock, MapPin, Award, BookOpen, FileText, Save, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

const EXAM_COMPONENTS = [
  { key: "Internal 1", label: "Internal 1", total: 30 },
  { key: "Internal 2", label: "Internal 2", total: 30 },
  { key: "Internal Lab", label: "Internal Lab", total: 25 },
  { key: "External", label: "External", total: 100 },
  { key: "External Lab", label: "External Lab", total: 50 },
];

function getGrade(score, total) {
  if (!total || total <= 0) return "-";
  const pct = (score / total) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

export default function Exam() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Student view
  const [studentMarks, setStudentMarks] = useState([]);
  const [examData, setExamData] = useState({ upcoming: [], results: [] });

  // Teacher view
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedComponent, setSelectedComponent] = useState(EXAM_COMPONENTS[0].key);
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({}); // { studentId: score }
  const [existingMarks, setExistingMarks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ============ STUDENT MODE ============
  useEffect(() => {
    if (user?.role !== "Student") return;
    let cancelled = false;
    setLoading(true);
    
    const load = async () => {
      try {
        const [exams, marks] = await Promise.all([
          fetchExams(),
          fetchMarksByStudent(user.id)
        ]);
        if (!cancelled) {
          setExamData(exams || { upcoming: [], results: [] });
          setStudentMarks(marks || []);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load exams");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  // ============ TEACHER / ADMIN MODE ============
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
        const [enrollments, allUsers, allMarks] = await Promise.all([
          fetchEnrollmentsByCourse(Number(selectedCourse)),
          fetchUsers(),
          fetchMarks()
        ]);
        const studentUsers = (allUsers || []).filter(u => u.role === "Student");
        const enrolledIds = new Set((enrollments || []).map(e => e.studentId));
        const enrolledStudents = studentUsers.filter(s => enrolledIds.has(s.id));
        setStudents(enrolledStudents);
        
        // Filter marks for this course
        const courseMarks = (allMarks || []).filter(m => {
          const course = courses.find(c => c.id === Number(selectedCourse));
          return course && (m.courseName === course.title || m.courseName === course.code);
        });
        setExistingMarks(courseMarks);
        
        // Pre-fill marks for selected component
        const map = {};
        enrolledStudents.forEach(s => {
          const existing = courseMarks.find(m => m.studentId === s.id && m.examName === selectedComponent);
          map[s.id] = existing ? existing.score : "";
        });
        setMarksMap(map);
      } catch (err) {
        console.error("Failed to load students:", err);
      }
    };
    load();
  }, [selectedCourse, selectedComponent, user?.role]);

  const handleSaveMarks = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    const course = courses.find(c => c.id === Number(selectedCourse));
    const component = EXAM_COMPONENTS.find(c => c.key === selectedComponent);
    try {
      for (const [studentId, score] of Object.entries(marksMap)) {
        if (score === "" || score === undefined) continue;
        await createMark({
          studentId: Number(studentId),
          courseName: course?.title || "",
          examName: selectedComponent,
          examId: EXAM_COMPONENTS.indexOf(component) + 1,
          score: Number(score),
          total: component.total,
          grade: getGrade(Number(score), component.total)
        });
      }
      showToast(`Marks saved for ${selectedComponent}!`);
    } catch (err) {
      showToast("Failed to save marks", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  // ============ TEACHER / ADMIN VIEW ============
  if (user?.role === "Teacher" || user?.role === "Admin") {
    const courseName = courses.find(c => c.id === Number(selectedCourse));
    const component = EXAM_COMPONENTS.find(c => c.key === selectedComponent);
    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl font-semibold text-white shadow-xl ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
            {toast.msg}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">📝 Manage Marks</h1>
          <p className="text-slate-400 mt-1">Enter marks for students by exam component</p>
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
              <label className="block text-sm font-semibold text-slate-400 mb-2">Exam Component</label>
              <select value={selectedComponent} onChange={e => setSelectedComponent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none">
                {EXAM_COMPONENTS.map(c => <option key={c.key} value={c.key}>{c.label} (Max: {c.total})</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleSaveMarks} disabled={saving || !selectedCourse || students.length === 0}
                className="w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </div>
          
          {/* Component Legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAM_COMPONENTS.map(c => (
              <span key={c.key} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedComponent === c.key
                  ? "bg-indigo-500 text-white border-indigo-500 shadow-lg"
                  : "bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-600"
              }`} onClick={() => setSelectedComponent(c.key)}>
                {c.label} ({c.total})
              </span>
            ))}
          </div>
        </div>

        {/* Student Marks Entry */}
        {selectedCourse && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                {courseName?.title || "Course"} — {selectedComponent} (Max: {component?.total})
              </h2>
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
                      <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-center">Score (/{component?.total})</th>
                      <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-center">Grade</th>
                      {/* Show all components summary */}
                      <th className="pb-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-center">All Components</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {students.map(s => {
                      const currentScore = marksMap[s.id];
                      const grade = currentScore !== "" && currentScore !== undefined ? getGrade(Number(currentScore), component.total) : "-";
                      // Get all marks for this student across all components
                      const allStudentMarks = existingMarks.filter(m => m.studentId === s.id);
                      return (
                        <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                          <td className="py-3 px-4 text-slate-400 text-sm">{s.email}</td>
                          <td className="py-3 px-4 text-center">
                            <input type="number" min="0" max={component?.total} value={marksMap[s.id] ?? ""}
                              onChange={e => setMarksMap(prev => ({ ...prev, [s.id]: e.target.value }))}
                              className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-center focus:border-indigo-500 outline-none"
                              placeholder="0" />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              grade === "A+" || grade === "A" ? "bg-emerald-500/20 text-emerald-400"
                              : grade === "B+" || grade === "B" ? "bg-blue-500/20 text-blue-400"
                              : grade === "C" || grade === "D" ? "bg-yellow-500/20 text-yellow-400"
                              : grade === "F" ? "bg-red-500/20 text-red-400"
                              : "bg-slate-700 text-slate-500"
                            }`}>{grade}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {EXAM_COMPONENTS.map(comp => {
                                const mark = allStudentMarks.find(m => m.examName === comp.key);
                                return (
                                  <span key={comp.key} title={`${comp.label}: ${mark ? `${mark.score}/${mark.total}` : "N/A"}`}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                      mark ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-700/50 text-slate-500"
                                    }`}>
                                    {comp.label.split(" ")[0]}{mark ? `: ${mark.score}` : ""}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
  const upcoming = examData?.upcoming ?? [];
  const results = examData?.results ?? [];

  // Group student marks by course
  const marksByCourse = {};
  (studentMarks || []).forEach(m => {
    if (!marksByCourse[m.courseName]) marksByCourse[m.courseName] = [];
    marksByCourse[m.courseName].push(m);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Exams & Marks</h1>
          <p className="text-slate-400 mt-1">View your exam schedule and marks breakdown</p>
        </div>
      </div>

      {/* MARKS BREAKDOWN BY COMPONENT */}
      {Object.keys(marksByCourse).length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Award className="text-indigo-400 w-5 h-5" />
            Marks Breakdown by Component
          </h2>
          <div className="space-y-6">
            {Object.entries(marksByCourse).map(([courseName, marks]) => (
              <div key={courseName} className="border border-slate-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 text-lg">{courseName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {EXAM_COMPONENTS.map(comp => {
                    const mark = marks.find(m => m.examName === comp.key);
                    return (
                      <div key={comp.key} className={`rounded-xl p-3 text-center border ${
                        mark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-slate-700/30 border-slate-700/50"
                      }`}>
                        <p className="text-xs text-slate-400 font-semibold mb-1">{comp.label}</p>
                        {mark ? (
                          <>
                            <p className="text-xl font-bold text-white">{mark.score}<span className="text-sm text-slate-400">/{mark.total}</span></p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                              mark.grade === "A+" || mark.grade === "A" ? "bg-emerald-500/20 text-emerald-400"
                              : mark.grade === "B+" || mark.grade === "B" ? "bg-blue-500/20 text-blue-400"
                              : "bg-yellow-500/20 text-yellow-400"
                            }`}>{mark.grade}</span>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-slate-500">—</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      <FileText className="w-3.5 h-3.5" /> {exam.syllabus}
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

        {/* RECENT RESULTS */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg overflow-hidden flex flex-col">
          <div className="border-b border-slate-700/50 pb-4 mb-4">
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
                        <td className="py-4 px-4 font-semibold text-slate-200 whitespace-nowrap">{row.course}</td>
                        <td className="py-4 px-4 text-slate-300 whitespace-nowrap">{row.exam}</td>
                        <td className="py-4 px-4 font-medium text-white">{row.score}<span className="text-slate-500">/{row.total}</span></td>
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
