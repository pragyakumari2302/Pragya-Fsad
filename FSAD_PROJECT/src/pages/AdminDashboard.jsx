import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/mockApi";

const cardStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, backdropFilter: "blur(10px)" };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "#1e2540", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const btnPrimary = { padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 };
const btnDanger = { ...btnPrimary, background: "linear-gradient(135deg, #ef4444, #dc2626)" };
const btnSmall = { padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 };
const modalBox = { background: "#1a1f35", borderRadius: 20, padding: 32, width: "90%", maxWidth: 500, color: "#fff", border: "1px solid rgba(255,255,255,0.1)", boxSizing: "border-box" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
const thStyle = { textAlign: "left", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontWeight: 600, fontSize: 12, textTransform: "uppercase" };
const tdStyle = { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#e2e8f0" };

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 200 }}>
    <div style={{ fontSize: 32, width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}20` }}>{icon}</div>
    <div><div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{value}</div><div style={{ fontSize: 13, color: "#94a3b8" }}>{label}</div></div>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={modalOverlay} onClick={onClose}>
    <div style={modalBox} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 24, cursor: "pointer" }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const FormField = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [feeItems, setFeeItems] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [libraryIssues, setLibraryIssues] = useState([]);
  const [dbView, setDbView] = useState(null);
  const [dbStats, setDbStats] = useState(null);

  // Forms
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddFee, setShowAddFee] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [showEditCourse, setShowEditCourse] = useState(null);
  const [showStudentDetail, setShowStudentDetail] = useState(null);

  const [showAddEnrollment, setShowAddEnrollment] = useState(false);
  const [showAddAttendance, setShowAddAttendance] = useState(false);
  const [showAddMark, setShowAddMark] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddIssue, setShowAddIssue] = useState(false);

  const [studentForm, setStudentForm] = useState({ name: "", email: "", department: "" });
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", department: "" });
  const [courseForm, setCourseForm] = useState({ code: "", title: "", credits: 3, semester: "Spring 2026", instructor: "", schedule: "", room: "", status: "Active", seats: "0/60" });
  const [feeForm, setFeeForm] = useState({ name: "", category: "tuition", amount: 0, semester: "Spring 2026" });
  const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "", totalCopies: 1, availableCopies: 1 });
  
  const [enrollmentForm, setEnrollmentForm] = useState({ studentId: "", courseId: "", status: "active" });
  const [attendanceForm, setAttendanceForm] = useState({ studentId: "", courseId: "", date: new Date().toISOString().split("T")[0], status: "present" });
  const [markForm, setMarkForm] = useState({ studentId: "", courseName: "", examName: "", score: 0, total: 100, grade: "A" });
  const [paymentForm, setPaymentForm] = useState({ studentId: "", feeItemId: "", amountPaid: 0, method: "card" });
  const [issueForm, setIssueForm] = useState({ studentId: "", bookId: "" });

  const [editUserForm, setEditUserForm] = useState({});
  const [editCourseForm, setEditCourseForm] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [u, c, e, a, m, fi, fp, lb, li] = await Promise.all([
        api.fetchUsers(), api.fetchCourses(), api.fetchEnrollments(),
        api.fetchAttendance(), api.fetchMarks(), api.fetchFeeItems(),
        api.fetchFeePayments(), api.fetchLibraryBooks(), api.fetchLibraryIssues()
      ]);
      setUsers(u); setCourses(c); setEnrollments(e);
      setAttendance(a); setMarks(m); setFeeItems(fi);
      setFeePayments(fp); setLibraryBooks(lb); setLibraryIssues(li);
    } catch (err) { console.error("Load failed:", err); }
  };

  useEffect(() => { loadData(); }, []);

  const loadDbView = async () => {
    try {
      const [view, stats] = await Promise.all([api.fetchDatabaseView(), api.fetchDatabaseStats()]);
      setDbView(view); setDbStats(stats);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (activeTab === "database") loadDbView(); }, [activeTab]);

  if (!user || user.role !== "Admin") return null;

  const students = users.filter(u => u.role === "Student");
  const teachers = users.filter(u => u.role === "Teacher");

  const stats = {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    totalFeeItems: feeItems.length,
    totalBooks: libraryBooks.length
  };

  // CRUD Handlers
  const handleAddStudent = async () => {
    if (!studentForm.name || !studentForm.email) return showToast("Fill all fields", "error");
    const pwd = studentForm.password || studentForm.email;
    try {
      await api.createUser({ ...studentForm, password: pwd, role: "Student", status: "active", joinedAt: new Date().toISOString().split("T")[0] });
      showToast("Student added!"); setShowAddStudent(false); setStudentForm({ name: "", email: "", department: "", password: "" }); loadData();
    } catch { showToast("Failed to add student", "error"); }
  };

  const handleAddTeacher = async () => {
    if (!teacherForm.name || !teacherForm.email) return showToast("Fill all fields", "error");
    try {
      await api.createUser({ ...teacherForm, role: "Teacher", status: "active", joinedAt: new Date().toISOString().split("T")[0] });
      showToast("Teacher added!"); setShowAddTeacher(false); setTeacherForm({ name: "", email: "", department: "" }); loadData();
    } catch { showToast("Failed to add teacher", "error"); }
  };

  const handleAddCourse = async () => {
    if (!courseForm.code || !courseForm.title) return showToast("Fill all fields", "error");
    try {
      await api.createCourse(courseForm);
      showToast("Course created!"); setShowAddCourse(false); setCourseForm({ code: "", title: "", credits: 3, semester: "Spring 2026", instructor: "", schedule: "", room: "", status: "Active", seats: "0/60" }); loadData();
    } catch { showToast("Failed", "error"); }
  };

  const handleAddFee = async () => {
    if (!feeForm.name || !feeForm.amount) return showToast("Fill all fields", "error");
    try {
      await api.createFeeItem(feeForm);
      showToast("Fee item added!"); setShowAddFee(false); setFeeForm({ name: "", category: "tuition", amount: 0, semester: "Spring 2026" }); loadData();
    } catch { showToast("Failed", "error"); }
  };

  const handleAddBook = async () => {
    if (!bookForm.title || !bookForm.author) return showToast("Fill all fields", "error");
    try {
      await api.createLibraryBook(bookForm);
      showToast("Book added!"); setShowAddBook(false); setBookForm({ title: "", author: "", isbn: "", category: "", totalCopies: 1, availableCopies: 1 }); loadData();
    } catch { showToast("Failed", "error"); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await api.deleteUser(id); showToast("User deleted"); loadData(); }
    catch { showToast("Failed", "error"); }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try { await api.deleteCourse(id); showToast("Course deleted"); loadData(); }
    catch { showToast("Failed", "error"); }
  };

  const handleDeleteFee = async (id) => {
    if (!window.confirm("Delete this fee item?")) return;
    try { await api.deleteFeeItem(id); showToast("Fee item deleted"); loadData(); }
    catch { showToast("Failed", "error"); }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try { await api.deleteLibraryBook(id); showToast("Book deleted"); loadData(); }
    catch { showToast("Failed", "error"); }
  };

  const handleAddEnrollment = async () => { try { await api.createEnrollment({ ...enrollmentForm, enrolledAt: new Date().toISOString().split('T')[0] }); showToast("Enrollment added"); setShowAddEnrollment(false); loadData(); } catch { showToast("Failed", "error"); } };
  const handleDeleteEnrollment = async (id) => { if (!window.confirm("Delete?")) return; try { await api.deleteEnrollment(id); showToast("Deleted"); loadData(); } catch { showToast("Failed", "error"); } };

  const handleAddAttendance = async () => { try { await api.createAttendance(attendanceForm); showToast("Attendance added"); setShowAddAttendance(false); loadData(); } catch { showToast("Failed", "error"); } };
  const handleDeleteAttendance = async (id) => { if (!window.confirm("Delete?")) return; try { await api.deleteAttendance(id); showToast("Deleted"); loadData(); } catch { showToast("Failed", "error"); } };

  const handleAddMark = async () => { try { await api.createMark(markForm); showToast("Mark added"); setShowAddMark(false); loadData(); } catch { showToast("Failed", "error"); } };
  const handleDeleteMark = async (id) => { if (!window.confirm("Delete?")) return; try { await api.deleteMark(id); showToast("Deleted"); loadData(); } catch { showToast("Failed", "error"); } };

  const handleAddPayment = async () => { try { await api.createFeePayment(paymentForm); showToast("Payment recorded"); setShowAddPayment(false); loadData(); } catch { showToast("Failed", "error"); } };
  const handleDeletePayment = async (id) => { if (!window.confirm("Delete?")) return; try { await api.deleteFeePayment(id); showToast("Deleted"); loadData(); } catch { showToast("Failed", "error"); } };

  const handleAddIssue = async () => { try { await api.createLibraryIssue(issueForm); showToast("Issued"); setShowAddIssue(false); loadData(); } catch { showToast("Failed", "error"); } };
  const handleReturnIssue = async (id) => { try { await api.returnLibraryBook(id); showToast("Returned"); loadData(); } catch { showToast("Failed", "error"); } };
  const handleDeleteIssue = async (id) => { if (!window.confirm("Delete?")) return; try { await api.deleteLibraryIssue(id); showToast("Deleted"); loadData(); } catch { showToast("Failed", "error"); } };

  const startEditUser = (u) => { setShowEditUser(u); setEditUserForm({ name: u.name, email: u.email, role: u.role, department: u.department, status: u.status, section: u.section || "", teacherId: u.teacherId || "" }); };
  const handleSaveEditUser = async () => {
    try { await api.updateUser(showEditUser.id, editUserForm); showToast("User updated"); setShowEditUser(null); loadData(); }
    catch { showToast("Failed", "error"); }
  };

  const startEditCourse = (c) => { setShowEditCourse(c); setEditCourseForm({ ...c }); };
  const handleSaveEditCourse = async () => {
    try { await api.updateCourse(showEditCourse.id, editCourseForm); showToast("Course updated"); setShowEditCourse(null); loadData(); }
    catch { showToast("Failed", "error"); }
  };

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const tabs = [
    { id: "dashboard", label: "🏠 Overview", icon: "🏠" },
    { id: "students", label: "🎓 Students", icon: "🎓" },
    { id: "teachers", label: "👨‍🏫 Teachers", icon: "👨‍🏫" },
    { id: "courses", label: "📚 Courses", icon: "📚" },
    { id: "enrollments", label: "🔗 Enrollments", icon: "🔗" },
    { id: "attendance", label: "✅ Attendance", icon: "✅" },
    { id: "marks", label: "📝 Marks", icon: "📝" },
    { id: "fees", label: "💰 Fees", icon: "💰" },
    { id: "library", label: "📖 Library", icon: "📖" },
    { id: "timetable", label: "📅 Timetable", icon: "📅" },
    { id: "database", label: "🗄️ Database View", icon: "🗄️" },
    { id: "profile", label: "👤 Profile", icon: "👤" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1d 0%, #111827 50%, #0f172a 100%)", color: "#fff", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, padding: "14px 24px", borderRadius: 12, background: toast.type === "error" ? "#ef4444" : "#22c55e", color: "#fff", fontWeight: 600, zIndex: 99999, boxShadow: "0 10px 30px rgba(0,0,0,0.3)", animation: "fadeIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Mobile toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: "fixed", top: 16, left: 16, zIndex: 9999, background: "#1e293b", border: "none", color: "#fff", padding: "10px 14px", borderRadius: 10, cursor: "pointer", display: "none", fontSize: 20 }} className="admin-mobile-toggle">☰</button>

      {/* Sidebar */}
      <aside style={{ width: 260, background: "#0a0f1d", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: sidebarOpen ? 0 : undefined, zIndex: 9998, transition: "all 0.3s" }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
            <div><div style={{ fontWeight: 700, fontSize: 16 }}>CampusCore</div><div style={{ fontSize: 12, color: "#6366f1" }}>Admin Panel</div></div>
          </div>
        </div>
        <div style={{ padding: "16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{user?.name?.charAt(0) || "A"}</div>
          <div><div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name || "Admin"}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>Administrator</div></div>
        </div>
        <nav style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", background: activeTab === t.id ? "rgba(99,102,241,0.15)" : "transparent", color: activeTab === t.id ? "#818cf8" : "#94a3b8", cursor: "pointer", fontSize: 14, fontWeight: activeTab === t.id ? 600 : 400, marginBottom: 2, textAlign: "left", transition: "all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={handleLogout} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontWeight: 600 }}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 260, padding: 32, minHeight: "100vh" }}>
        {/* ==== OVERVIEW ==== */}
        {activeTab === "dashboard" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Admin Dashboard</h1>
            <p style={{ color: "#94a3b8", marginBottom: 32 }}>Full platform control and management</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
              <StatCard icon="🎓" label="Students" value={stats.totalStudents} color="#6366f1" />
              <StatCard icon="👨‍🏫" label="Teachers" value={stats.totalTeachers} color="#22d3ee" />
              <StatCard icon="📚" label="Courses" value={stats.totalCourses} color="#f59e0b" />
              <StatCard icon="🔗" label="Enrollments" value={stats.totalEnrollments} color="#22c55e" />
              <StatCard icon="💰" label="Fee Items" value={stats.totalFeeItems} color="#ec4899" />
              <StatCard icon="📖" label="Library Books" value={stats.totalBooks} color="#8b5cf6" />
            </div>
            <h3 style={{ marginBottom: 16, color: "#e2e8f0" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button style={btnPrimary} onClick={() => setShowAddStudent(true)}>➕ Add Student</button>
              <button style={btnPrimary} onClick={() => setShowAddTeacher(true)}>➕ Add Teacher</button>
              <button style={{ ...btnPrimary, background: "linear-gradient(135deg, #f59e0b, #d97706)" }} onClick={() => setShowAddCourse(true)}>➕ Create Course</button>
              <button style={{ ...btnPrimary, background: "linear-gradient(135deg, #22c55e, #16a34a)" }} onClick={() => setShowAddFee(true)}>➕ Add Fee Item</button>
              <button style={{ ...btnPrimary, background: "linear-gradient(135deg, #ec4899, #db2777)" }} onClick={() => setShowAddBook(true)}>➕ Add Book</button>
              <button style={{ ...btnPrimary, background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }} onClick={() => setActiveTab("database")}>🗄️ Database View</button>
            </div>
          </div>
        )}

        {/* ==== STUDENTS ==== */}
        {activeTab === "students" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>🎓 Manage Students</h1>
              <button style={btnPrimary} onClick={() => setShowAddStudent(true)}>➕ Add Student</button>
            </div>
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Department</th><th style={thStyle}>Status</th><th style={thStyle}>Section</th><th style={thStyle}>Teacher</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td style={tdStyle}>{s.name}</td><td style={tdStyle}>{s.email}</td><td style={tdStyle}>{s.department || "-"}</td>
                      <td style={tdStyle}><span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: s.status === "active" ? "#22c55e" : "#ef4444" }}>{s.status}</span></td>
                      <td style={tdStyle}>{s.section || "-"}</td>
                      <td style={tdStyle}>{s.teacherId ? teachers.find(t => t.id === s.teacherId)?.name || s.teacherId : "-"}</td>
                      <td style={tdStyle}>
                        <button style={{ ...btnSmall, background: "#0ea5e9", color: "#fff", marginRight: 6 }} onClick={() => setShowStudentDetail(s)}>👁️ View</button>
                        <button style={{ ...btnSmall, background: "#2563eb", color: "#fff", marginRight: 6 }} onClick={() => startEditUser(s)}>✏️ Edit</button>
                        <button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeleteUser(s.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No students yet. Click "Add Student" to create one.</p>}
            </div>
          </div>
        )}

        {/* ==== TEACHERS ==== */}
        {activeTab === "teachers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>👨‍🏫 Manage Teachers</h1>
              <button style={btnPrimary} onClick={() => setShowAddTeacher(true)}>➕ Add Teacher</button>
            </div>
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Department</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t.id}>
                      <td style={tdStyle}>{t.name}</td><td style={tdStyle}>{t.email}</td><td style={tdStyle}>{t.department || "-"}</td>
                      <td style={tdStyle}><span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>{t.status}</span></td>
                      <td style={tdStyle}>
                        <button style={{ ...btnSmall, background: "#2563eb", color: "#fff", marginRight: 6 }} onClick={() => startEditUser(t)}>✏️ Edit</button>
                        <button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeleteUser(t.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {teachers.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No teachers yet.</p>}
            </div>
          </div>
        )}

        {/* ==== COURSES ==== */}
        {activeTab === "courses" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>📚 Manage Courses</h1>
              <button style={btnPrimary} onClick={() => setShowAddCourse(true)}>➕ Create Course</button>
            </div>
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Code</th><th style={thStyle}>Title</th><th style={thStyle}>Credits</th><th style={thStyle}>Instructor</th><th style={thStyle}>Schedule</th><th style={thStyle}>Room</th><th style={thStyle}>Seats</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "#818cf8" }}>{c.code}</td><td style={tdStyle}>{c.title}</td><td style={tdStyle}>{c.credits}</td>
                      <td style={tdStyle}>{c.instructor}</td><td style={tdStyle}>{c.schedule}</td><td style={tdStyle}>{c.room}</td><td style={tdStyle}>{c.seats}</td>
                      <td style={tdStyle}>
                        <button style={{ ...btnSmall, background: "#2563eb", color: "#fff", marginRight: 6 }} onClick={() => startEditCourse(c)}>✏️</button>
                        <button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeleteCourse(c.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==== ENROLLMENTS ==== */}
        {activeTab === "enrollments" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>🔗 Course Enrollment Management</h1>
              <button style={btnPrimary} onClick={() => setShowAddEnrollment(true)}>➕ Assign Course to Student</button>
            </div>
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>ID</th><th style={thStyle}>Student</th><th style={thStyle}>Course</th><th style={thStyle}>Enrolled At</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {enrollments.map(e => {
                    const student = users.find(u => u.id === e.studentId);
                    const course = courses.find(c => c.id === e.courseId);
                    return (
                      <tr key={e.id}>
                        <td style={tdStyle}>{e.id}</td>
                        <td style={tdStyle}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{student?.name || `Student #${e.studentId}`}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{student?.email || ""}</div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{course?.title || `Course #${e.courseId}`}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{course?.code || ""}</div>
                          </div>
                        </td>
                        <td style={tdStyle}>{e.enrolledAt}</td>
                        <td style={tdStyle}><span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: e.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: e.status === "active" ? "#22c55e" : "#ef4444" }}>{e.status}</span></td>
                        <td style={tdStyle}><button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeleteEnrollment(e.id)}>🗑️ Remove</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {enrollments.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No enrollments yet. Click "Assign Course to Student" to get started.</p>}
            </div>
          </div>
        )}

        {/* ==== ATTENDANCE ==== */}
        {activeTab === "attendance" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>✅ Attendance Records</h1>
              <button style={btnPrimary} onClick={() => setShowAddAttendance(true)}>➕ Record Attendance</button>
            </div>
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>ID</th><th style={thStyle}>Student</th><th style={thStyle}>Course</th><th style={thStyle}>Date</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {attendance.map(a => (
                    <tr key={a.id}><td style={tdStyle}>{a.id}</td><td style={tdStyle}>{a.studentId}</td><td style={tdStyle}>{a.courseId}</td><td style={tdStyle}>{a.date}</td>
                      <td style={tdStyle}><span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: a.status === "present" ? "rgba(34,197,94,0.15)" : a.status === "late" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", color: a.status === "present" ? "#22c55e" : a.status === "late" ? "#f59e0b" : "#ef4444" }}>{a.status}</span></td>
                      <td style={tdStyle}><button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeleteAttendance(a.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No attendance records.</p>}
            </div>
          </div>
        )}

        {/* ==== MARKS ==== */}
        {activeTab === "marks" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>📝 Marks & Grades</h1>
              <button style={btnPrimary} onClick={() => setShowAddMark(true)}>➕ Add Mark</button>
            </div>
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Student</th><th style={thStyle}>Course</th><th style={thStyle}>Exam</th><th style={thStyle}>Score</th><th style={thStyle}>Total</th><th style={thStyle}>Grade</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {marks.map(m => (
                    <tr key={m.id}><td style={tdStyle}>{m.studentId}</td><td style={tdStyle}>{m.courseName}</td><td style={tdStyle}>{m.examName}</td>
                      <td style={tdStyle}><span style={{ fontWeight: 700, color: "#22c55e" }}>{m.score}</span></td><td style={tdStyle}>{m.total}</td>
                      <td style={tdStyle}><span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>{m.grade}</span></td>
                      <td style={tdStyle}><button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeleteMark(m.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {marks.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No marks recorded.</p>}
            </div>
          </div>
        )}

        {/* ==== FEES ==== */}
        {activeTab === "fees" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>💰 Fee Management</h1>
              <button style={btnPrimary} onClick={() => setShowAddFee(true)}>➕ Add Fee Item</button>
            </div>
            <h3 style={{ color: "#e2e8f0", marginBottom: 12 }}>Fee Structure</h3>
            <div style={{ ...cardStyle, marginBottom: 32 }}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Name</th><th style={thStyle}>Category</th><th style={thStyle}>Amount</th><th style={thStyle}>Semester</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {feeItems.map(f => (
                    <tr key={f.id}><td style={tdStyle}>{f.name}</td><td style={tdStyle}><span style={{ textTransform: "capitalize" }}>{f.category}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: 700, color: "#22c55e" }}>₹{f.amount?.toLocaleString()}</span></td><td style={tdStyle}>{f.semester}</td>
                      <td style={tdStyle}><button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeleteFee(f.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)", fontWeight: 700, color: "#22c55e", fontSize: 18 }}>Total: ₹{feeItems.reduce((s, f) => s + (f.amount || 0), 0).toLocaleString()}</div>
            </div>
            <h3 style={{ color: "#e2e8f0", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
              <span>Payment Records</span>
              <button style={{ ...btnSmall, background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff" }} onClick={() => setShowAddPayment(true)}>➕ Record Payment</button>
            </h3>
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Student</th><th style={thStyle}>Fee Item</th><th style={thStyle}>Amount</th><th style={thStyle}>Paid At</th><th style={thStyle}>Method</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {feePayments.map(p => (
                    <tr key={p.id}><td style={tdStyle}>{p.studentId}</td><td style={tdStyle}>{p.feeItemId}</td><td style={tdStyle}>₹{p.amountPaid?.toLocaleString()}</td>
                      <td style={tdStyle}>{p.paidAt}</td><td style={tdStyle}>{p.method}</td>
                      <td style={tdStyle}><span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>{p.status}</span></td>
                      <td style={tdStyle}><button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeletePayment(p.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {feePayments.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No payments recorded.</p>}
            </div>
          </div>
        )}

        {/* ==== LIBRARY ==== */}
        {activeTab === "library" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>📖 Library Management</h1>
              <button style={btnPrimary} onClick={() => setShowAddBook(true)}>➕ Add Book</button>
            </div>
            <h3 style={{ color: "#e2e8f0", marginBottom: 12 }}>Book Catalog</h3>
            <div style={{ ...cardStyle, marginBottom: 32 }}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Title</th><th style={thStyle}>Author</th><th style={thStyle}>ISBN</th><th style={thStyle}>Category</th><th style={thStyle}>Available</th><th style={thStyle}>Total</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {libraryBooks.map(b => (
                    <tr key={b.id}><td style={tdStyle}>{b.title}</td><td style={tdStyle}>{b.author}</td><td style={{ ...tdStyle, fontSize: 12, color: "#94a3b8" }}>{b.isbn}</td>
                      <td style={tdStyle}>{b.category}</td><td style={tdStyle}><span style={{ fontWeight: 700, color: b.availableCopies > 0 ? "#22c55e" : "#ef4444" }}>{b.availableCopies}</span></td>
                      <td style={tdStyle}>{b.totalCopies}</td>
                      <td style={tdStyle}><button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeleteBook(b.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 style={{ color: "#e2e8f0", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
              <span>Issue Records</span>
              <button style={{ ...btnSmall, background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff" }} onClick={() => setShowAddIssue(true)}>➕ Issue Book</button>
            </h3>
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Student</th><th style={thStyle}>Book</th><th style={thStyle}>Issued</th><th style={thStyle}>Due</th><th style={thStyle}>Returned</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th></tr></thead>
                <tbody>
                  {libraryIssues.map(i => (
                    <tr key={i.id}><td style={tdStyle}>{i.studentId}</td><td style={tdStyle}>{i.bookId}</td><td style={tdStyle}>{i.issuedAt}</td><td style={tdStyle}>{i.dueDate}</td>
                      <td style={tdStyle}>{i.returnedAt || "-"}</td>
                      <td style={tdStyle}><span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: i.status === "returned" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: i.status === "returned" ? "#22c55e" : "#f59e0b" }}>{i.status}</span></td>
                      <td style={tdStyle}>
                        {i.status !== "returned" && <button style={{ ...btnSmall, background: "#22c55e", color: "#fff", marginRight: 6 }} onClick={() => handleReturnIssue(i.id)}>🔄 Return</button>}
                        <button style={{ ...btnSmall, background: "#ef4444", color: "#fff" }} onClick={() => handleDeleteIssue(i.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {libraryIssues.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No issues.</p>}
            </div>
          </div>
        )}

        {/* ==== TIMETABLE ==== */}
        {activeTab === "timetable" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>📅 Timetable Management</h1>
            </div>
            <div style={cardStyle}>
              <p style={{ color: "#94a3b8", padding: 16, textAlign: "center" }}>
                Timetable entries are managed through the database. Use the <strong>Database View</strong> tab to see all timetable records,
                or create entries via the API at <code>/api/timetable</code>.
              </p>
              <div style={{ padding: 16, textAlign: "center" }}>
                <button style={btnPrimary} onClick={() => setActiveTab("database")}>🗄️ View in Database</button>
              </div>
            </div>
          </div>
        )}

        {/* ==== DATABASE VIEW ==== */}
        {activeTab === "database" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>🗄️ Database Live View</h1>
              <button style={btnPrimary} onClick={loadDbView}>🔄 Refresh</button>
            </div>
            {dbStats && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
                {Object.entries(dbStats).map(([table, count]) => (
                  <div key={table} style={{ ...cardStyle, minWidth: 140, textAlign: "center", padding: 16 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#818cf8" }}>{count}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{table}</div>
                  </div>
                ))}
              </div>
            )}
            {dbView && Object.entries(dbView).map(([table, rows]) => (
              <div key={table} style={{ marginBottom: 32 }}>
                <h3 style={{ color: "#e2e8f0", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📋</span> {table} <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>({Array.isArray(rows) ? rows.length : 1} rows)</span>
                </h3>
                <div style={{ ...cardStyle, overflow: "auto" }}>
                  {Array.isArray(rows) && rows.length > 0 ? (
                    <table style={tableStyle}>
                      <thead><tr>{Object.keys(rows[0]).map(k => <th key={k} style={thStyle}>{k}</th>)}</tr></thead>
                      <tbody>{rows.map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j} style={{ ...tdStyle, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeof v === "object" ? JSON.stringify(v) : String(v ?? "")}</td>)}</tr>)}</tbody>
                    </table>
                  ) : typeof rows === "object" && !Array.isArray(rows) ? (
                    <table style={tableStyle}>
                      <tbody>{Object.entries(rows).map(([k, v]) => <tr key={k}><td style={{ ...tdStyle, fontWeight: 600 }}>{k}</td><td style={tdStyle}>{String(v)}</td></tr>)}</tbody>
                    </table>
                  ) : <p style={{ color: "#94a3b8", padding: 16, textAlign: "center" }}>Empty</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==== PROFILE ==== */}
        {activeTab === "profile" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>👤 Admin Profile</h1>
            <div style={{ ...cardStyle, maxWidth: 500 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>{user?.name?.charAt(0)}</div>
                <div><div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div><div style={{ color: "#94a3b8" }}>{user?.email}</div><div style={{ color: "#6366f1", fontSize: 13, fontWeight: 600 }}>Administrator</div></div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><span style={{ color: "#94a3b8" }}>Username</span><span>{user?.username}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><span style={{ color: "#94a3b8" }}>Department</span><span>{user?.department}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><span style={{ color: "#94a3b8" }}>Status</span><span style={{ color: "#22c55e" }}>{user?.status}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span style={{ color: "#94a3b8" }}>Joined</span><span>{user?.joinedAt}</span></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==== MODALS ==== */}
      {showAddStudent && (
        <Modal title="➕ Add Student" onClose={() => setShowAddStudent(false)}>
          <FormField label="Name" value={studentForm.name} onChange={v => setStudentForm(p => ({ ...p, name: v }))} placeholder="Full name" />
          <FormField label="Email" value={studentForm.email} onChange={v => setStudentForm(p => ({ ...p, email: v }))} type="email" placeholder="student@email.com" />
          <FormField label="Department" value={studentForm.department} onChange={v => setStudentForm(p => ({ ...p, department: v }))} placeholder="Computer Science" />
          <FormField label="Password" value={studentForm.password || ""} onChange={v => setStudentForm(p => ({ ...p, password: v }))} type="text" placeholder="Leave empty to use email as default" />
          <button style={{ ...btnPrimary, width: "100%", marginTop: 8 }} onClick={handleAddStudent}>Create Student</button>
        </Modal>
      )}

      {showAddTeacher && (
        <Modal title="➕ Add Teacher" onClose={() => setShowAddTeacher(false)}>
          <FormField label="Name" value={teacherForm.name} onChange={v => setTeacherForm(p => ({ ...p, name: v }))} placeholder="Full name" />
          <FormField label="Email" value={teacherForm.email} onChange={v => setTeacherForm(p => ({ ...p, email: v }))} type="email" placeholder="teacher@email.com" />
          <FormField label="Department" value={teacherForm.department} onChange={v => setTeacherForm(p => ({ ...p, department: v }))} placeholder="Mathematics" />
          <button style={{ ...btnPrimary, width: "100%", marginTop: 8 }} onClick={handleAddTeacher}>Create Teacher</button>
        </Modal>
      )}

      {showAddCourse && (
        <Modal title="➕ Create Course" onClose={() => setShowAddCourse(false)}>
          <FormField label="Code" value={courseForm.code} onChange={v => setCourseForm(p => ({ ...p, code: v }))} placeholder="CSE301" />
          <FormField label="Title" value={courseForm.title} onChange={v => setCourseForm(p => ({ ...p, title: v }))} placeholder="Course Name" />
          <FormField label="Credits" value={courseForm.credits} onChange={v => setCourseForm(p => ({ ...p, credits: parseInt(v) || 0 }))} type="number" />
          <FormField label="Instructor" value={courseForm.instructor} onChange={v => setCourseForm(p => ({ ...p, instructor: v }))} placeholder="Prof. Name" />
          <FormField label="Schedule" value={courseForm.schedule} onChange={v => setCourseForm(p => ({ ...p, schedule: v }))} placeholder="Mon, Wed 09:00 - 11:00" />
          <FormField label="Room" value={courseForm.room} onChange={v => setCourseForm(p => ({ ...p, room: v }))} placeholder="Room 101" />
          <button style={{ ...btnPrimary, width: "100%", marginTop: 8 }} onClick={handleAddCourse}>Create Course</button>
        </Modal>
      )}

      {showAddFee && (
        <Modal title="➕ Add Fee Item" onClose={() => setShowAddFee(false)}>
          <FormField label="Name" value={feeForm.name} onChange={v => setFeeForm(p => ({ ...p, name: v }))} placeholder="Tuition Fee" />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Category</label>
            <select value={feeForm.category} onChange={e => setFeeForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="tuition">Tuition</option><option value="lab">Lab</option><option value="library">Library</option><option value="hostel">Hostel</option><option value="misc">Miscellaneous</option>
            </select>
          </div>
          <FormField label="Amount (₹)" value={feeForm.amount} onChange={v => setFeeForm(p => ({ ...p, amount: parseFloat(v) || 0 }))} type="number" />
          <button style={{ ...btnPrimary, width: "100%", marginTop: 8 }} onClick={handleAddFee}>Add Fee Item</button>
        </Modal>
      )}

      {showAddBook && (
        <Modal title="➕ Add Book" onClose={() => setShowAddBook(false)}>
          <FormField label="Title" value={bookForm.title} onChange={v => setBookForm(p => ({ ...p, title: v }))} placeholder="Book Title" />
          <FormField label="Author" value={bookForm.author} onChange={v => setBookForm(p => ({ ...p, author: v }))} placeholder="Author Name" />
          <FormField label="ISBN" value={bookForm.isbn} onChange={v => setBookForm(p => ({ ...p, isbn: v }))} placeholder="978-0000000000" />
          <FormField label="Category" value={bookForm.category} onChange={v => setBookForm(p => ({ ...p, category: v }))} placeholder="Computer Science" />
          <FormField label="Total Copies" value={bookForm.totalCopies} onChange={v => setBookForm(p => ({ ...p, totalCopies: parseInt(v) || 1, availableCopies: parseInt(v) || 1 }))} type="number" />
          <button style={{ ...btnPrimary, width: "100%", marginTop: 8 }} onClick={handleAddBook}>Add Book</button>
        </Modal>
      )}

      {showEditUser && (
        <Modal title="✏️ Edit User" onClose={() => setShowEditUser(null)}>
          <FormField label="Name" value={editUserForm.name || ""} onChange={v => setEditUserForm(p => ({ ...p, name: v }))} />
          <FormField label="Email" value={editUserForm.email || ""} onChange={v => setEditUserForm(p => ({ ...p, email: v }))} type="email" />
          <FormField label="Department" value={editUserForm.department || ""} onChange={v => setEditUserForm(p => ({ ...p, department: v }))} />
          <FormField label="Section" value={editUserForm.section || ""} onChange={v => setEditUserForm(p => ({ ...p, section: v }))} placeholder="A, B, C..." />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Assigned Teacher</label>
            <select value={editUserForm.teacherId || ""} onChange={e => setEditUserForm(p => ({ ...p, teacherId: e.target.value ? Number(e.target.value) : null }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">None</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name} (ID: {t.id})</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Role</label>
            <select value={editUserForm.role || ""} onChange={e => setEditUserForm(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="Student">Student</option><option value="Teacher">Teacher</option><option value="Admin">Admin</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Status</label>
            <select value={editUserForm.status || "active"} onChange={e => setEditUserForm(p => ({ ...p, status: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
          <button style={{ ...btnPrimary, width: "100%", marginTop: 8 }} onClick={handleSaveEditUser}>Save Changes</button>
        </Modal>
      )}

      {showEditCourse && (
        <Modal title="✏️ Edit Course" onClose={() => setShowEditCourse(null)}>
          <FormField label="Code" value={editCourseForm.code || ""} onChange={v => setEditCourseForm(p => ({ ...p, code: v }))} />
          <FormField label="Title" value={editCourseForm.title || ""} onChange={v => setEditCourseForm(p => ({ ...p, title: v }))} />
          <FormField label="Credits" value={editCourseForm.credits || 0} onChange={v => setEditCourseForm(p => ({ ...p, credits: parseInt(v) || 0 }))} type="number" />
          <FormField label="Instructor" value={editCourseForm.instructor || ""} onChange={v => setEditCourseForm(p => ({ ...p, instructor: v }))} />
          <FormField label="Schedule" value={editCourseForm.schedule || ""} onChange={v => setEditCourseForm(p => ({ ...p, schedule: v }))} />
          <FormField label="Room" value={editCourseForm.room || ""} onChange={v => setEditCourseForm(p => ({ ...p, room: v }))} />
          <FormField label="Seats" value={editCourseForm.seats || ""} onChange={v => setEditCourseForm(p => ({ ...p, seats: v }))} />
          <button style={{ ...btnPrimary, width: "100%", marginTop: 8 }} onClick={handleSaveEditCourse}>Save Changes</button>
        </Modal>
      )}

      {showAddEnrollment && (
        <Modal title="➕ Assign Course to Student" onClose={() => setShowAddEnrollment(false)}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Select Student</label>
            <select value={enrollmentForm.studentId} onChange={e => setEnrollmentForm(p => ({ ...p, studentId: Number(e.target.value) }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">-- Choose a Student --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Select Course</label>
            <select value={enrollmentForm.courseId} onChange={e => setEnrollmentForm(p => ({ ...p, courseId: Number(e.target.value) }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">-- Choose a Course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title} ({c.credits} credits)</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Status</label>
            <select value={enrollmentForm.status} onChange={e => setEnrollmentForm(p => ({ ...p, status: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="active">Active</option>
              <option value="dropped">Dropped</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          {enrollmentForm.studentId && (
            <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13 }}>
              <p style={{ color: "#818cf8", fontWeight: 600, marginBottom: 4 }}>📋 Current enrollments for this student:</p>
              {enrollments.filter(e => e.studentId === enrollmentForm.studentId).length === 0
                ? <p style={{ color: "#94a3b8" }}>No courses assigned yet.</p>
                : enrollments.filter(e => e.studentId === enrollmentForm.studentId).map(e => {
                    const c = courses.find(cc => cc.id === e.courseId);
                    return <p key={e.id} style={{ color: "#cbd5e1" }}>• {c?.code || ""} — {c?.title || `Course #${e.courseId}`} ({e.status})</p>;
                  })
              }
            </div>
          )}
          <button style={{ ...btnPrimary, width: "100%", marginTop: 8 }} onClick={handleAddEnrollment} disabled={!enrollmentForm.studentId || !enrollmentForm.courseId}>Assign Course</button>
        </Modal>
      )}

      {/* ==== STUDENT DETAIL VIEW ==== */}
      {showStudentDetail && (() => {
        const s = showStudentDetail;
        const studentEnrollments = enrollments.filter(e => e.studentId === s.id);
        const studentMarks = marks.filter(m => m.studentId === s.id);
        const studentAttendance = attendance.filter(a => a.studentId === s.id);
        const studentPayments = feePayments.filter(p => p.studentId === s.id);
        const assignedTeacher = teachers.find(t => t.id === s.teacherId);
        const totalPresent = studentAttendance.filter(a => a.status === "present").length;
        const attendanceRate = studentAttendance.length > 0 ? Math.round((totalPresent / studentAttendance.length) * 100) : 0;
        return (
          <div style={modalOverlay} onClick={() => setShowStudentDetail(null)}>
            <div style={{ ...modalBox, maxWidth: 800, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 22 }}>👤 Student Profile — {s.name}</h2>
                <button onClick={() => setShowStudentDetail(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 24, cursor: "pointer" }}>×</button>
              </div>

              {/* BASIC INFO */}
              <div style={{ ...cardStyle, marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
                  <div><span style={{ color: "#94a3b8" }}>Email:</span> <span style={{ color: "#fff", fontWeight: 600 }}>{s.email}</span></div>
                  <div><span style={{ color: "#94a3b8" }}>Department:</span> <span style={{ color: "#fff", fontWeight: 600 }}>{s.department || "-"}</span></div>
                  <div><span style={{ color: "#94a3b8" }}>Section:</span> <span style={{ color: "#fff", fontWeight: 600 }}>{s.section || "-"}</span></div>
                  <div><span style={{ color: "#94a3b8" }}>Status:</span> <span style={{ color: s.status === "active" ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{s.status}</span></div>
                  <div><span style={{ color: "#94a3b8" }}>Assigned Teacher:</span> <span style={{ color: "#818cf8", fontWeight: 600 }}>{assignedTeacher ? `${assignedTeacher.name} (${assignedTeacher.email})` : "Not assigned"}</span></div>
                  <div><span style={{ color: "#94a3b8" }}>Attendance:</span> <span style={{ color: attendanceRate >= 75 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{attendanceRate}% ({totalPresent}/{studentAttendance.length})</span></div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button style={{ ...btnSmall, background: "#2563eb", color: "#fff" }} onClick={() => { setShowStudentDetail(null); startEditUser(s); }}>✏️ Edit Student</button>
                  <button style={{ ...btnSmall, background: "#6366f1", color: "#fff" }} onClick={() => { setEnrollmentForm({ studentId: s.id, courseId: "", status: "active" }); setShowStudentDetail(null); setShowAddEnrollment(true); }}>➕ Assign Course</button>
                </div>
              </div>

              {/* ENROLLED COURSES */}
              <div style={{ ...cardStyle, marginBottom: 16 }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#e2e8f0" }}>📚 Enrolled Courses ({studentEnrollments.length})</h3>
                {studentEnrollments.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>No courses enrolled. Click "Assign Course" above to add.</p>
                ) : (
                  <table style={{ ...tableStyle, fontSize: 13 }}>
                    <thead><tr><th style={thStyle}>Course</th><th style={thStyle}>Code</th><th style={thStyle}>Instructor</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr></thead>
                    <tbody>
                      {studentEnrollments.map(e => {
                        const c = courses.find(cc => cc.id === e.courseId);
                        return (
                          <tr key={e.id}>
                            <td style={tdStyle}>{c?.title || `#${e.courseId}`}</td>
                            <td style={tdStyle}>{c?.code || "-"}</td>
                            <td style={tdStyle}>{c?.instructor || "-"}</td>
                            <td style={tdStyle}><span style={{ padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: e.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: e.status === "active" ? "#22c55e" : "#ef4444" }}>{e.status}</span></td>
                            <td style={tdStyle}><button style={{ ...btnSmall, background: "#ef4444", color: "#fff", fontSize: 11 }} onClick={async () => { await api.deleteEnrollment(e.id); showToast("Removed"); await loadData(); setShowStudentDetail({...s}); }}>Remove</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* MARKS / GRADES */}
              <div style={{ ...cardStyle, marginBottom: 16 }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#e2e8f0" }}>📝 Marks & Grades ({studentMarks.length})</h3>
                {studentMarks.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>No marks recorded yet.</p>
                ) : (
                  <table style={{ ...tableStyle, fontSize: 13 }}>
                    <thead><tr><th style={thStyle}>Course</th><th style={thStyle}>Exam</th><th style={thStyle}>Score</th><th style={thStyle}>Grade</th></tr></thead>
                    <tbody>
                      {studentMarks.map(m => (
                        <tr key={m.id}>
                          <td style={tdStyle}>{m.courseName || "-"}</td>
                          <td style={tdStyle}>{m.examName || "-"}</td>
                          <td style={tdStyle}>{m.score}/{m.total}</td>
                          <td style={tdStyle}><span style={{ padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>{m.grade}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* FEE PAYMENTS */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#e2e8f0" }}>💰 Fee Payments ({studentPayments.length})</h3>
                {studentPayments.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>No payments recorded.</p>
                ) : (
                  <table style={{ ...tableStyle, fontSize: 13 }}>
                    <thead><tr><th style={thStyle}>Fee Item</th><th style={thStyle}>Amount</th><th style={thStyle}>Method</th><th style={thStyle}>Status</th><th style={thStyle}>Paid At</th></tr></thead>
                    <tbody>
                      {studentPayments.map(p => {
                        const fi = feeItems.find(f => f.id === p.feeItemId);
                        return (
                          <tr key={p.id}>
                            <td style={tdStyle}>{fi?.name || `#${p.feeItemId}`}</td>
                            <td style={tdStyle}>₹{p.amountPaid?.toLocaleString()}</td>
                            <td style={tdStyle}>{p.method || "-"}</td>
                            <td style={tdStyle}><span style={{ padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: p.status === "paid" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: p.status === "paid" ? "#22c55e" : "#f59e0b" }}>{p.status}</span></td>
                            <td style={tdStyle}>{p.paidAt || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @media (max-width: 768px) {
          .admin-mobile-toggle { display: block !important; }
          main { margin-left: 0 !important; padding: 16px !important; padding-top: 60px !important; }
          aside { transform: translateX(${sidebarOpen ? "0" : "-100%"}); }
          table { font-size: 12px !important; }
        }
        select, select option {
          background-color: #1e2540 !important;
          color: #fff !important;
        }
        select option:hover, select option:checked {
          background-color: #6366f1 !important;
        }
      `}</style>
    </div>
  );
}
