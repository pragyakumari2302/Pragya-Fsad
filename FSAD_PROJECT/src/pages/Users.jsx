import { useState, useEffect } from "react";
import { fetchUsers, fetchCourses, createUser, createEnrollment } from "../api/mockApi";
import { Users as UsersIcon, UserPlus, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Loader from "../components/ui/Loader";

function StatusBadge({ value }) {
  const isActive = value.toLowerCase() === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
        isActive 
         ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
         : "bg-red-500/10 text-red-400 border-red-500/20"
      }`}
    >
      {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      <span className="capitalize">{value}</span>
    </span>
  );
}

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [courseId, setCourseId] = useState("");
   const [showAddModal, setShowAddModal] = useState(false);
   const [showAssignModal, setShowAssignModal] = useState(false);
   const [savingUser, setSavingUser] = useState(false);
   const [actionError, setActionError] = useState(null);
   const [newUser, setNewUser] = useState({
      name: "",
      email: "",
      role: "Student",
      department: "Computer Science",
      status: "active"
   });

   const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
         const res = await fetchUsers();
         setData(res || []);
      } catch (err) {
         setError(err?.message || "Failed to load users");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchCourses().then((res) => setCourses(res || []));
      loadUsers();
   }, []);

   const handleAddUser = async (event) => {
      event.preventDefault();
      setSavingUser(true);
      setActionError(null);
      try {
         const payload = {
            ...newUser,
            username: newUser.email,
            joinedAt: new Date().toISOString().slice(0, 10)
         };
         await createUser(payload);
         setShowAddModal(false);
         setNewUser({ name: "", email: "", role: "Student", department: "Computer Science", status: "active" });
         await loadUsers();
      } catch (err) {
         setActionError(err?.message || "Failed to create user");
      } finally {
         setSavingUser(false);
      }
   };

   const handleAssignCourse = async (event) => {
      event.preventDefault();
      if (!selectedUser || !courseId) return;
      setAssigning(true);
      setActionError(null);
      try {
         await createEnrollment({
            studentId: selectedUser.id,
            courseId: Number(courseId),
            status: "active"
         });
         setShowAssignModal(false);
         setSelectedUser(null);
         setCourseId("");
      } catch (err) {
         setActionError(err?.message || "Failed to assign course");
      } finally {
         setAssigning(false);
      }
   };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Users</h1>
          <p className="text-slate-400 mt-1">Manage students, teachers, and staff</p>
        </div>
            <button
               onClick={() => {
                  setShowAddModal(true);
                  setActionError(null);
               }}
               className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
            >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

         {actionError && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p className="font-medium">{actionError}</p>
            </div>
         )}

      {/* TABLE CARD */}
      <div className="bg-slate-800 rounded-2xl p-0 sm:p-6 border border-slate-700 shadow-lg overflow-hidden flex flex-col min-h-[400px]">
         <div className="p-6 sm:p-0 border-b border-slate-700/50 pb-4 mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
               <UsersIcon className="text-indigo-400 w-5 h-5"/>
               Directory
            </h2>
            <div className="text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/50">
               {data.length} Total
            </div>
         </div>

         <div className="overflow-x-auto flex-1 relative">
            {loading ? (
               <div className="absolute inset-0 flex justify-center items-center bg-slate-800/50 z-10 backdrop-blur-sm">
                  <Loader />
               </div>
            ) : null}

            <table className="table-auto w-full text-left border-collapse min-w-[800px]">
               <thead>
                  <tr className="border-b border-slate-700/50">
                     <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Name</th>
                     <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Email</th>
                     <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Role</th>
                     <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Department</th>
                     <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Status</th>
                     <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Joined</th>
                     <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/30">
                  {data.length === 0 && !loading ? (
                     <tr>
                        <td colSpan={7} className="py-12 text-center">
                           <p className="text-slate-500 font-medium">No users found in the system.</p>
                        </td>
                     </tr>
                  ) : (
                     data.map((user, idx) => (
                        <tr key={idx} className="group hover:bg-slate-700/50 hover:scale-[1.01] transition-all duration-200">
                           <td className="py-4 px-6 sm:px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
                                    {user.name.charAt(0).toUpperCase()}
                                 </div>
                                 <p className="font-bold text-white tracking-tight">{user.name}</p>
                              </div>
                           </td>
                           <td className="py-4 px-6 sm:px-4 text-slate-300 whitespace-nowrap">
                              {user.email}
                           </td>
                           <td className="py-4 px-6 sm:px-4 whitespace-nowrap">
                              <span className="text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-600">
                                 {user.role}
                              </span>
                           </td>
                           <td className="py-4 px-6 sm:px-4 text-slate-300 whitespace-nowrap">
                              {user.department}
                           </td>
                           <td className="py-4 px-6 sm:px-4 whitespace-nowrap">
                              <StatusBadge value={user.status} />
                           </td>
                           <td className="py-4 px-6 sm:px-4 text-right text-slate-400 whitespace-nowrap text-sm">
                              {user.joinedAt}
                           </td>
                                        <td className="py-4 px-6 sm:px-4 text-right whitespace-nowrap">
                                             {user.role === "Student" ? (
                                                <button
                                                   onClick={() => {
                                                      setSelectedUser(user);
                                                      setCourseId("");
                                                      setShowAssignModal(true);
                                                      setActionError(null);
                                                   }}
                                                   className="px-3 py-1.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 transition-colors"
                                                >
                                                   Assign Course
                                                </button>
                                             ) : (
                                                <span className="text-xs text-slate-500">-</span>
                                             )}
                                        </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

         {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
               <form onSubmit={handleAddUser} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl">
                  <h3 className="text-xl font-extrabold text-white mb-6">Add New User</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Name</label>
                        <input
                           type="text"
                           value={newUser.name}
                           onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                           required
                        />
                     </div>
                     <div>
                        <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Email</label>
                        <input
                           type="email"
                           value={newUser.email}
                           onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                           required
                        />
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Role</label>
                           <select
                              value={newUser.role}
                              onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                           >
                              <option value="Student">Student</option>
                              <option value="Teacher">Teacher</option>
                              <option value="Admin">Admin</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Status</label>
                           <select
                              value={newUser.status}
                              onChange={(e) => setNewUser((prev) => ({ ...prev, status: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                           >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                           </select>
                        </div>
                     </div>
                     <div>
                        <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Department</label>
                        <input
                           type="text"
                           value={newUser.department}
                           onChange={(e) => setNewUser((prev) => ({ ...prev, department: e.target.value }))}
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                           required
                        />
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">Default password is set to 1234 and user must change it on first login.</p>
                  <div className="flex justify-end gap-3 mt-6">
                     <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
                     <button type="submit" disabled={savingUser} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50">
                        {savingUser ? "Saving..." : "Create User"}
                     </button>
                  </div>
               </form>
            </div>
         )}

         {showAssignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
               <form onSubmit={handleAssignCourse} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl">
                  <h3 className="text-xl font-extrabold text-white mb-6">Assign Course</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Student</label>
                        <input
                           type="text"
                           value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : ""}
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                           readOnly
                        />
                     </div>
                     <div>
                        <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Course</label>
                        <select
                           value={courseId}
                           onChange={(e) => setCourseId(e.target.value)}
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                           required
                        >
                           <option value="">Select course</option>
                           {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                 {course.code} - {course.title}
                              </option>
                           ))}
                        </select>
                     </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                     <button type="button" onClick={() => setShowAssignModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
                     <button type="submit" disabled={assigning} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50">
                        {assigning ? "Assigning..." : "Assign"}
                     </button>
                  </div>
               </form>
            </div>
         )}
    </div>
  );
}
