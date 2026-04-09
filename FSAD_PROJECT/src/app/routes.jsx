import React from "react";

import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Courses from "../pages/Courses";
import Exam from "../pages/Exam";
import AcademicRegistration from "../pages/AcademicRegistration";
import Attendance from "../pages/Attendance";
import FeePayments from "../pages/FeePayments";
import Library from "../pages/Library";
import CGPA from "../pages/CGPA";
import Timetable from "../pages/Timetable";
import Profile from "../pages/Profile";

export const routes = [
  { path: "/", element: <Dashboard /> },
  { path: "/academic-registration", element: <AcademicRegistration /> },
  { path: "/attendance", element: <Attendance /> },
  { path: "/courses", element: <Courses /> },
  { path: "/exam", element: <Exam /> },
  { path: "/fee-payments", element: <FeePayments /> },
  { path: "/library", element: <Library /> },
  { path: "/cgpa", element: <CGPA /> },
  { path: "/timetable", element: <Timetable /> },
  { path: "/users", element: <Users /> },
  { path: "/reports", element: <Reports /> },
  { path: "/profile", element: <Profile /> },
  { path: "/settings", element: <Settings /> },
];