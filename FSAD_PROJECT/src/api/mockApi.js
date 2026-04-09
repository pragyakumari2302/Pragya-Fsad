/**
 * API client for CampusCore ERP backend.
 * Uses VITE_API_URL if provided, otherwise defaults to local Spring Boot.
 *
 * When the backend is unreachable (e.g. Vercel deployment without a live backend)
 * every API call gracefully falls back to bundled JSON mock data so the UI remains
 * fully explorable as a demo.
 */

import dashboardMock from "../mock/dashboard.json";
import usersMock     from "../mock/users.json";
import coursesMock   from "../mock/courses.json";
import examsMock     from "../mock/exams.json";
import reportsMock   from "../mock/reports.json";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:9090/api";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isDemoMode() {
  return localStorage.getItem("cc_demo") === "true";
}

function getHeaders() {
  const token = localStorage.getItem("jwtToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Generic GET with demo-mode fallback */
async function apiGet(path, mockFallback = null) {
  if (isDemoMode() && mockFallback !== null) return mockFallback;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: getHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn(`apiGet ${path} failed, using mock`, err);
    if (mockFallback !== null) {
      localStorage.setItem("cc_demo", "true");
      return mockFallback;
    }
    throw err;
  }
}

async function apiPost(path, body) {
  if (isDemoMode()) return { id: Date.now(), ...body, _demo: true };
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST", headers: getHeaders(), body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function apiPut(path, body) {
  if (isDemoMode()) return { ...body, _demo: true };
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT", headers: getHeaders(), body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

async function apiDelete(path) {
  if (isDemoMode()) return null;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE", headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

/* ------------------------------------------------------------------ */
/*  Mock data generators for modules without dedicated JSON files       */
/* ------------------------------------------------------------------ */

const mockAttendance = [
  { id: 1, studentId: 1, courseId: 101, date: "2026-04-01", status: "Present" },
  { id: 2, studentId: 1, courseId: 102, date: "2026-04-01", status: "Absent" },
  { id: 3, studentId: 2, courseId: 101, date: "2026-04-01", status: "Present" },
];

const mockEnrollments = [
  { id: 1, studentId: 1, courseId: 101, semester: "Spring 2026", status: "Active" },
  { id: 2, studentId: 2, courseId: 102, semester: "Spring 2026", status: "Active" },
];

const mockMarks = [
  { id: 1, studentId: 1, examId: 1, courseId: 101, marks: 85, grade: "A" },
  { id: 2, studentId: 2, examId: 1, courseId: 101, marks: 72, grade: "B" },
];

const mockFeeItems = [
  { id: 1, name: "Tuition Fee", amount: 50000, semester: "Spring 2026" },
  { id: 2, name: "Library Fee", amount: 2000, semester: "Spring 2026" },
  { id: 3, name: "Lab Fee", amount: 5000, semester: "Spring 2026" },
];

const mockFeePayments = [
  { id: 1, studentId: 1, feeItemId: 1, amount: 50000, date: "2026-01-15", status: "Paid" },
  { id: 2, studentId: 1, feeItemId: 2, amount: 2000, date: "2026-01-15", status: "Paid" },
];

const mockLibraryBooks = [
  { id: 1, title: "Data Structures & Algorithms", author: "Thomas H. Cormen", isbn: "978-0262033848", available: true },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", available: false },
  { id: 3, title: "Design Patterns", author: "Gang of Four", isbn: "978-0201633610", available: true },
];

const mockLibraryIssues = [
  { id: 1, studentId: 1, bookId: 2, issueDate: "2026-03-01", dueDate: "2026-04-01", returned: false },
];

const mockDatabase = {
  tables: ["users", "courses", "enrollments", "attendance", "exams", "marks", "fees", "library"],
  totalRecords: 156,
};

const mockDatabaseStats = { users: 25, courses: 12, enrollments: 48, exams: 6, marks: 96 };

/* ------------------------------------------------------------------ */
/*  Exported API functions                                             */
/* ------------------------------------------------------------------ */

// ---- Users ----
export async function fetchUsers()            { return apiGet("/users", usersMock); }
export async function createUser(user)        { return apiPost("/users", user); }
export async function updateUser(id, data)    { return apiPut(`/users/${id}`, data); }
export async function deleteUser(id)          { return apiDelete(`/users/${id}`); }

// ---- Dashboard ----
export async function fetchDashboard()        { return apiGet("/dashboard", dashboardMock); }

// ---- Courses ----
export async function fetchCourses()          { return apiGet("/courses", coursesMock); }
export async function createCourse(course)    { return apiPost("/courses", course); }
export async function updateCourse(id, data)  { return apiPut(`/courses/${id}`, data); }
export async function deleteCourse(id)        { return apiDelete(`/courses/${id}`); }

// ---- Exams ----
export async function fetchExams()            { return apiGet("/exams", examsMock); }

// ---- Reports ----
export async function fetchReports()          { return apiGet("/reports", reportsMock); }

// ---- Enrollments ----
export async function fetchEnrollments()                    { return apiGet("/enrollments", mockEnrollments); }
export async function fetchEnrollmentsByStudent(studentId)  { return apiGet(`/enrollments/student/${studentId}`, mockEnrollments.filter(e => e.studentId === studentId)); }
export async function fetchEnrollmentsByCourse(courseId)    { return apiGet(`/enrollments/course/${courseId}`, mockEnrollments.filter(e => e.courseId === courseId)); }
export async function createEnrollment(enrollment)         { return apiPost("/enrollments", enrollment); }
export async function updateEnrollment(id, data)           { return apiPut(`/enrollments/${id}`, data); }
export async function deleteEnrollment(id)                 { return apiDelete(`/enrollments/${id}`); }

// ---- Attendance ----
export async function fetchAttendance()                    { return apiGet("/attendance", mockAttendance); }
export async function fetchAttendanceByStudent(studentId)  { return apiGet(`/attendance/student/${studentId}`, mockAttendance.filter(a => a.studentId === studentId)); }
export async function fetchAttendanceByCourse(courseId)    { return apiGet(`/attendance/course/${courseId}`, mockAttendance.filter(a => a.courseId === courseId)); }
export async function createAttendance(record)             { return apiPost("/attendance", record); }
export async function createBulkAttendance(records)        { return apiPost("/attendance/bulk", records); }
export async function updateAttendance(id, data)           { return apiPut(`/attendance/${id}`, data); }
export async function deleteAttendance(id)                 { return apiDelete(`/attendance/${id}`); }

// ---- Marks ----
export async function fetchMarks()                         { return apiGet("/marks", mockMarks); }
export async function fetchMarksByStudent(studentId)       { return apiGet(`/marks/student/${studentId}`, mockMarks.filter(m => m.studentId === studentId)); }
export async function fetchMarksByExam(examId)             { return apiGet(`/marks/exam/${examId}`, mockMarks.filter(m => m.examId === examId)); }
export async function createMark(mark)                     { return apiPost("/marks", mark); }
export async function createBulkMarks(marks)               { return apiPost("/marks/bulk", marks); }
export async function updateMark(id, data)                 { return apiPut(`/marks/${id}`, data); }
export async function deleteMark(id)                       { return apiDelete(`/marks/${id}`); }

// ---- Fees ----
export async function fetchFeeItems()                      { return apiGet("/fees/items", mockFeeItems); }
export async function createFeeItem(item)                  { return apiPost("/fees/items", item); }
export async function updateFeeItem(id, data)              { return apiPut(`/fees/items/${id}`, data); }
export async function deleteFeeItem(id)                    { return apiDelete(`/fees/items/${id}`); }
export async function fetchFeePayments()                   { return apiGet("/fees/payments", mockFeePayments); }
export async function fetchFeePaymentsByStudent(studentId) { return apiGet(`/fees/payments/student/${studentId}`, mockFeePayments.filter(p => p.studentId === studentId)); }
export async function createFeePayment(payment)            { return apiPost("/fees/payments", payment); }
export async function updateFeePayment(id, data)           { return apiPut(`/fees/payments/${id}`, data); }
export async function deleteFeePayment(id)                 { return apiDelete(`/fees/payments/${id}`); }

// ---- Library ----
export async function fetchLibraryBooks()                  { return apiGet("/library/books", mockLibraryBooks); }
export async function createLibraryBook(book)              { return apiPost("/library/books", book); }
export async function updateLibraryBook(id, data)          { return apiPut(`/library/books/${id}`, data); }
export async function deleteLibraryBook(id)                { return apiDelete(`/library/books/${id}`); }
export async function fetchLibraryIssues()                 { return apiGet("/library/issues", mockLibraryIssues); }
export async function fetchLibraryIssuesByStudent(studentId){ return apiGet(`/library/issues/student/${studentId}`, mockLibraryIssues.filter(i => i.studentId === studentId)); }
export async function createLibraryIssue(issue)            { return apiPost("/library/issues", issue); }
export async function returnLibraryBook(issueId)           { return apiPost(`/library/issues/${issueId}/return`, {}); }
export async function deleteLibraryIssue(id)               { return apiDelete(`/library/issues/${id}`); }

// ---- Database View (Admin) ----
export async function fetchDatabaseView()                  { return apiGet("/database", mockDatabase); }
export async function fetchDatabaseStats()                 { return apiGet("/database/stats", mockDatabaseStats); }
