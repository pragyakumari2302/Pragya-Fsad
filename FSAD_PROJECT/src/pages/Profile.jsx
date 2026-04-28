import { useState, useEffect } from "react";
import { User, Mail, GraduationCap, MapPin, Edit3, Fingerprint, CalendarDays, Phone, BookOpen, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

export default function Profile() {
   const { user, login } = useAuth();
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [showPasswordModal, setShowPasswordModal] = useState(false);
   const [newPassword, setNewPassword] = useState("");
   const [savingPassword, setSavingPassword] = useState(false);

   useEffect(() => {
      if (!user) return;
      const profileData = {
         name: user.name || "Student",
         email: user.email || "-",
         studentId: user.role === "Student" ? `STU-${String(user.id).padStart(4, "0")}` : "-",
         rollNumber: "-",
         phone: "-",
         dateOfBirth: "-",
         gender: "-",
         address: "-",
         program: user.role === "Student" ? "Undergraduate Program" : user.role,
         department: user.department || "-",
         semester: "-",
         enrollmentStatus: user.status || "active",
         joiningDate: user.joinedAt || "-"
      };
      setData(profileData);
      setLoading(false);
   }, [user]);

   useEffect(() => {
      if (user?.passwordChangeRequired) {
         setShowPasswordModal(true);
      }
   }, [user?.passwordChangeRequired]);

   const handleChangePassword = async (e) => {
      e.preventDefault();
      setSavingPassword(true);
      try {
         const API = import.meta.env.VITE_API_URL || "http://localhost:9090/api";
         const token = localStorage.getItem("token");
         const res = await fetch(`${API}/users/${user.id}/change-password`, {
            method: "POST",
            headers: { 
               "Content-Type": "application/json",
               ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ newPassword })
         });
         if (res.ok) {
            alert("Password changed successfully!");
            login({ ...user, passwordChangeRequired: false });
            setShowPasswordModal(false);
            setNewPassword("");
         } else {
            alert("Failed to change password. Please try again.");
         }
      } catch (err) {
         alert("Network Error");
      } finally {
         setSavingPassword(false);
      }
   };

   if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Profile</h1>
          <p className="text-slate-400 mt-1">View and manage your personal information</p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
           <button onClick={() => setShowPasswordModal(true)} className="px-5 py-2.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2 mt-3 sm:mt-0">Change Password</button>
      </div>

      {/* PROFILE HEADER CARD */}
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-lg relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/10 pointer-events-none"></div>
         <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-5xl font-extrabold shadow-xl border-4 border-slate-800">
               {data?.name.charAt(0)}
            </div>
            <div className="text-center md:text-left flex-1 mt-2">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                     <h2 className="text-3xl font-bold text-white tracking-tight">{data?.name}</h2>
                     <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-3 text-slate-300">
                        <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-400" /> {data?.email}</span>
                        <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-indigo-400" /> {data?.program}</span>
                     </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2 inline-flex m-auto md:m-0">
                     <ShieldCheck className="w-5 h-5 text-emerald-400" />
                     <div>
                        <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Status</p>
                        <p className="text-sm font-bold text-emerald-400 leading-none">{data?.enrollmentStatus}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ACADEMIC INFO */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-3">
             <BookOpen className="w-4 h-4 text-indigo-400" />
             Academic Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                 <Fingerprint className="w-5 h-5 text-slate-500" />
                 <p className="text-sm text-slate-400 font-medium">Student ID</p>
              </div>
              <p className="font-semibold text-white">{data?.studentId}</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                 <User className="w-5 h-5 text-slate-500" />
                 <p className="text-sm text-slate-400 font-medium">Roll Number</p>
              </div>
              <p className="font-semibold text-white">{data?.rollNumber}</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                 <GraduationCap className="w-5 h-5 text-slate-500" />
                 <p className="text-sm text-slate-400 font-medium">Department</p>
              </div>
              <p className="font-semibold text-white">{data?.department}</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                 <Clock className="w-5 h-5 text-slate-500" />
                 <p className="text-sm text-slate-400 font-medium">Semester</p>
              </div>
              <p className="font-semibold text-white">{data?.semester}</p>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-3">
             <User className="w-4 h-4 text-violet-400" />
             Personal Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                 <CalendarDays className="w-5 h-5 text-slate-500" />
                 <p className="text-sm text-slate-400 font-medium">Date of Birth</p>
              </div>
              <p className="font-semibold text-white">{data?.dateOfBirth}</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                 <User className="w-5 h-5 text-slate-500" />
                 <p className="text-sm text-slate-400 font-medium">Gender</p>
              </div>
              <p className="font-semibold text-white">{data?.gender}</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                 <Phone className="w-5 h-5 text-slate-500" />
                 <p className="text-sm text-slate-400 font-medium">Phone</p>
              </div>
              <p className="font-semibold text-white">{data?.phone}</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                 <CalendarDays className="w-5 h-5 text-slate-500" />
                 <p className="text-sm text-slate-400 font-medium">Joining Date</p>
              </div>
              <p className="font-semibold text-white">{data?.joiningDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
           <MapPin className="w-4 h-4 text-rose-400" /> Contact Address
        </h3>
        <div className="p-4 bg-slate-700/30 border border-slate-700/50 rounded-xl">
           <p className="text-slate-300 leading-relaxed max-w-2xl">{data?.address}</p>
        </div>
            </div>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <form onSubmit={handleChangePassword} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-sm w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
              <h3 className="text-xl font-extrabold text-white mb-6">Change Password</h3>
              {user?.passwordChangeRequired && (
                 <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-xl mb-4 text-sm font-medium border border-yellow-500/20 flex flex-col gap-2">
                    <p>⚠️ Welcome! Since this is your first login, please update your temporary password to continue.</p>
                 </div>
              )}
              <div className="mb-6">
                 <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">New Password</label>
                 <input type="password" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Minimum 4 characters" minLength="4" className="w-full bg-slate-900 border border-slate-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 rounded-xl px-4 py-3 text-white transition-all outline-none" />
              </div>
              <div className="flex justify-end gap-3">
                 {!user?.passwordChangeRequired && (
                     <button type="button" onClick={()=>setShowPasswordModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
                 )}
                 <button type="submit" disabled={savingPassword} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-yellow-500/25 disabled:opacity-50 w-full sm:w-auto transition-all">{savingPassword ? "Saving..." : "Update Password"}</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
}
