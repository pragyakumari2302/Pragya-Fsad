import { useState, useEffect } from "react";
import { fetchDashboard, fetchEnrollmentsByStudent, fetchCourses, fetchAttendanceByStudent, fetchMarksByStudent, fetchUsers, fetchTimetableByTeacher } from "../api/mockApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Loader from "../components/ui/Loader";

// Custom Sub-components
import StatCard from "../components/dashboard/StatCard";
import ClassesList from "../components/dashboard/ClassesList";
import AssignmentList from "../components/dashboard/AssignmentList";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import QuickActions from "../components/dashboard/QuickActions";

// Icons
import { GraduationCap, CheckCircle, BookOpen, Users, Calendar, Award } from "lucide-react";

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

function StudentDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ cgpa: 0, attendance: 0, activeCourses: 0, classes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (!user || user.role !== "Student") {
          if (!cancelled) setSummary({ cgpa: 0, attendance: 0, activeCourses: 0, classes: [] });
          return;
        }

        const [enrollments, courses, attendanceRecords, marks] = await Promise.all([
          fetchEnrollmentsByStudent(user.id),
          fetchCourses(),
          fetchAttendanceByStudent(user.id),
          fetchMarksByStudent(user.id)
        ]);

        const enrolledIds = new Set((enrollments || []).map((e) => e.courseId));
        const enrolledCourses = (courses || []).filter((course) => enrolledIds.has(course.id));

        const attended = (attendanceRecords || []).filter((record) => record.status === "present" || record.status === "late").length;
        const attendance = (attendanceRecords || []).length
          ? Math.round((attended / attendanceRecords.length) * 100)
          : 0;

        const normalizedMarks = (marks || []).map((mark) => {
          const grade = mark.grade ? mark.grade.toUpperCase() : "";
          return gradePoints[grade] ?? scoreToPoints(mark.score, mark.total);
        });
        const cgpa = normalizedMarks.length
          ? normalizedMarks.reduce((sum, points) => sum + points, 0) / normalizedMarks.length
          : 0;

        const classes = enrolledCourses.slice(0, 3).map((course) => ({
          time: course.schedule || "-",
          class: course.title || course.code,
          room: course.room || "-",
          instructor: course.instructor || ""
        }));

        if (!cancelled) {
          setSummary({
            cgpa,
            attendance,
            activeCourses: enrolledCourses.length,
            classes
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader /></div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top Banner / Welcome */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Student Portal</h1>
          <p className="text-slate-400">Here's your academic overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.href = '/reports'}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]"
          >
            Download Report
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Current CGPA" value={summary.cgpa.toFixed(2)} trend={summary.cgpa ? "Updated" : "No grades"} trendUp={summary.cgpa > 0} Icon={GraduationCap} />
        <StatCard title="Attendance" value={`${summary.attendance}%`} trend={summary.attendance ? "Updated" : "No records"} trendUp={summary.attendance >= 85} Icon={CheckCircle} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" delay={0.1} progress={summary.attendance} />
        <StatCard title="Active Courses" value={String(summary.activeCourses)} trend={summary.activeCourses ? "Assigned" : "No courses"} trendUp={summary.activeCourses > 0} Icon={BookOpen} iconColor="text-sky-400" iconBg="bg-sky-500/10" delay={0.2} />
      </div>

      {/* Main Grid: Assignments & Classes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <motion.div variants={item}>
            <AssignmentList assignments={[]} />
          </motion.div>
          <motion.div variants={item}>
            <QuickActions />
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={item}>
            <ClassesList classes={summary.classes} />
          </motion.div>
          
          <motion.div variants={item} className="h-96">
            <ActivityFeed activities={[]} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [dashRes, usersRes] = await Promise.all([
          fetchDashboard(),
          fetchCourses()
        ]);
        if (!cancelled) {
          setData(dashRes);
          // Try to get student count from users API (teacher sees only assigned students)
          try {
            const users = await fetchUsers();
            if (Array.isArray(users)) {
              setStudentCount(users.filter(u => u.role === "Student").length);
            }
          } catch { /* fallback */ }
          // Try to load timetable for teacher
          try {
            const timetable = await fetchTimetableByTeacher(user.id);
            if (Array.isArray(timetable) && timetable.length > 0) {
              const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
              const todayClasses = timetable
                .filter(t => t.day === today)
                .map(t => ({ time: t.timeSlot, class: t.courseTitle || t.courseCode, room: t.roomNumber }));
              setClasses(todayClasses.length > 0 ? todayClasses : [
                { time: "No classes", class: "No classes scheduled for today", room: "-" }
              ]);
            } else {
              setClasses([
                { time: "10:00 AM", class: "Advanced Algorithms", room: "Lecture Hall A" },
                { time: "01:00 PM", class: "Discrete Math", room: "Room 204" }
              ]);
            }
          } catch {
            setClasses([
              { time: "10:00 AM", class: "Advanced Algorithms", room: "Lecture Hall A" },
              { time: "01:00 PM", class: "Discrete Math", room: "Room 204" }
            ]);
          }
        }
      } catch (err) {
        console.error("Teacher dashboard load failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
      {[1,2,3,4].map(n => <div key={n} className="h-32 bg-slate-800/50 rounded-2xl" />)}
    </div>
  );

  const { stats = {} } = data || {};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Educator Dashboard</h1>
        <p className="text-slate-400">Manage your classes and monitor student progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="My Students" value={studentCount || stats.students || 0} Icon={Users} />
        <StatCard title="Classes Today" value={classes.length} Icon={Calendar} iconColor="text-sky-400" iconBg="bg-sky-500/10" delay={0.1} />
        <StatCard title="Pending Grades" value={42} Icon={Award} iconColor="text-amber-400" iconBg="bg-amber-500/10" delay={0.2} />
        <StatCard title="Avg Attendance" value="88%" trend="-1.5%" trendUp={false} Icon={CheckCircle} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" delay={0.3} progress={88} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         <div className="xl:col-span-2 space-y-6">
            <ClassesList classes={classes} />
         </div>
         <div>
            <div className="h-full min-h-[400px]">
               <ActivityFeed activities={[
                  { id: 1, title: 'John submitted Project 2', time: '1 hour ago', color: 'text-sky-400', bg: 'bg-sky-400/10' },
                  { id: 2, title: 'Attendance recorded', time: 'Yesterday', color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
               ]} />
            </div>
         </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-[1600px] mx-auto pb-10">
      {user?.role === "Teacher" ? <TeacherDashboard /> : <StudentDashboard />}
    </div>
  );
}

