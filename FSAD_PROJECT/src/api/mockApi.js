/**
 * API client for CampusCore ERP backend.
 * Uses VITE_API_URL if provided, otherwise defaults to local Spring Boot.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:9090/api";

function getHeaders() {
  const token = localStorage.getItem("jwtToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST", headers: getHeaders(), body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT", headers: getHeaders(), body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE", headers: getHeaders()
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

// ---- Users ----
export async function fetchUsers() { return apiGet("/users"); }
export async function createUser(user) { return apiPost("/users", user); }
export async function updateUser(id, data) { return apiPut(`/users/${id}`, data); }
export async function deleteUser(id) { return apiDelete(`/users/${id}`); }

// ---- Dashboard ----
export async function fetchDashboard() { return apiGet("/dashboard"); }

// ---- Courses ----
export async function fetchCourses() { return apiGet("/courses"); }
export async function createCourse(course) { return apiPost("/courses", course); }
export async function updateCourse(id, data) { return apiPut(`/courses/${id}`, data); }
export async function deleteCourse(id) { return apiDelete(`/courses/${id}`); }

// ---- Exams ----
export async function fetchExams() { return apiGet("/exams"); }

// ---- Reports ----
export async function fetchReports() { return apiGet("/reports"); }

// ---- Enrollments ----
export async function fetchEnrollments() { return apiGet("/enrollments"); }
export async function fetchEnrollmentsByStudent(studentId) { return apiGet(`/enrollments/student/${studentId}`); }
export async function fetchEnrollmentsByCourse(courseId) { return apiGet(`/enrollments/course/${courseId}`); }
export async function createEnrollment(enrollment) { return apiPost("/enrollments", enrollment); }
export async function updateEnrollment(id, data) { return apiPut(`/enrollments/${id}`, data); }
export async function deleteEnrollment(id) { return apiDelete(`/enrollments/${id}`); }

// ---- Attendance ----
export async function fetchAttendance() { return apiGet("/attendance"); }
export async function fetchAttendanceByStudent(studentId) { return apiGet(`/attendance/student/${studentId}`); }
export async function fetchAttendanceByCourse(courseId) { return apiGet(`/attendance/course/${courseId}`); }
export async function createAttendance(record) { return apiPost("/attendance", record); }
export async function createBulkAttendance(records) { return apiPost("/attendance/bulk", records); }
export async function updateAttendance(id, data) { return apiPut(`/attendance/${id}`, data); }
export async function deleteAttendance(id) { return apiDelete(`/attendance/${id}`); }

// ---- Marks ----
export async function fetchMarks() { return apiGet("/marks"); }
export async function fetchMarksByStudent(studentId) { return apiGet(`/marks/student/${studentId}`); }
export async function fetchMarksByExam(examId) { return apiGet(`/marks/exam/${examId}`); }
export async function createMark(mark) { return apiPost("/marks", mark); }
export async function createBulkMarks(marks) { return apiPost("/marks/bulk", marks); }
export async function updateMark(id, data) { return apiPut(`/marks/${id}`, data); }
export async function deleteMark(id) { return apiDelete(`/marks/${id}`); }

// ---- Fees ----
export async function fetchFeeItems() { return apiGet("/fees/items"); }
export async function createFeeItem(item) { return apiPost("/fees/items", item); }
export async function updateFeeItem(id, data) { return apiPut(`/fees/items/${id}`, data); }
export async function deleteFeeItem(id) { return apiDelete(`/fees/items/${id}`); }
export async function fetchFeePayments() { return apiGet("/fees/payments"); }
export async function fetchFeePaymentsByStudent(studentId) { return apiGet(`/fees/payments/student/${studentId}`); }
export async function createFeePayment(payment) { return apiPost("/fees/payments", payment); }
export async function updateFeePayment(id, data) { return apiPut(`/fees/payments/${id}`, data); }
export async function deleteFeePayment(id) { return apiDelete(`/fees/payments/${id}`); }

// ---- Library ----
export async function fetchLibraryBooks() { return apiGet("/library/books"); }
export async function createLibraryBook(book) { return apiPost("/library/books", book); }
export async function updateLibraryBook(id, data) { return apiPut(`/library/books/${id}`, data); }
export async function deleteLibraryBook(id) { return apiDelete(`/library/books/${id}`); }
export async function fetchLibraryIssues() { return apiGet("/library/issues"); }
export async function fetchLibraryIssuesByStudent(studentId) { return apiGet(`/library/issues/student/${studentId}`); }
export async function createLibraryIssue(issue) { return apiPost("/library/issues", issue); }
export async function returnLibraryBook(issueId) { return apiPost(`/library/issues/${issueId}/return`, {}); }
export async function deleteLibraryIssue(id) { return apiDelete(`/library/issues/${id}`); }

// ---- Database View (Admin) ----
export async function fetchDatabaseView() { return apiGet("/database"); }
export async function fetchDatabaseStats() { return apiGet("/database/stats"); }

// ---- Timetable ----
export async function fetchTimetable() { return apiGet("/timetable"); }
export async function fetchTimetableBySection(section) { return apiGet(`/timetable/section/${section}`); }
export async function fetchTimetableByTeacher(teacherId) { return apiGet(`/timetable/teacher/${teacherId}`); }
export async function createTimetableEntry(entry) { return apiPost("/timetable", entry); }
export async function updateTimetableEntry(id, data) { return apiPut(`/timetable/${id}`, data); }
export async function deleteTimetableEntry(id) { return apiDelete(`/timetable/${id}`); }
