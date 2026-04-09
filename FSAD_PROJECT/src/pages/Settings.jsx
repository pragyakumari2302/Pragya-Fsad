import { useState } from "react";
import { Settings as SettingsIcon, Save, Bell, Globe, CheckCircle } from "lucide-react";

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    institutionName: "CampusCore University",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    notifications: true,
    emailDigest: "weekly",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSaved(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-slate-400 mt-1">Configure your organization preferences</p>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">Settings saved successfully.</p>
        </div>
      )}

      {/* GENERAL SETTINGS */}
      <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 shadow-lg">
         <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4">
            <Globe className="w-5 h-5 text-indigo-400" />
            General Preferences
         </h2>
         <div className="grid gap-6 sm:grid-cols-2">
            
            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-300">Institution Name</label>
               <input 
                  type="text"
                  value={form.institutionName}
                  onChange={(e) => handleChange("institutionName", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                  placeholder="Enter institution name"
               />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-300">Timezone</label>
               <div className="relative">
                  <select 
                     value={form.timezone}
                     onChange={(e) => handleChange("timezone", e.target.value)}
                     className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                     <option value="Asia/Kolkata">Asia/Kolkata</option>
                     <option value="America/New_York">America/New York</option>
                     <option value="Europe/London">Europe/London</option>
                     <option value="Asia/Dubai">Asia/Dubai</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-300">Date Format</label>
               <div className="relative">
                  <select 
                     value={form.dateFormat}
                     onChange={(e) => handleChange("dateFormat", e.target.value)}
                     className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                     <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                     <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                     <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
               </div>
            </div>

         </div>

         <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-end">
          <button 
            disabled={loading}
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <>
                 <Save className="w-4 h-4" />
                 <span>Save Changes</span>
               </>
            )}
          </button>
         </div>
      </div>

      {/* NOTIFICATION SETTINGS */}
      <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 shadow-lg">
         <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4">
            <Bell className="w-5 h-5 text-emerald-400" />
            Notifications
         </h2>
         
         <div className="space-y-6">
            <label className="flex items-center gap-4 cursor-pointer group">
               <div className="relative flex items-center justify-center">
                  <input
                     type="checkbox"
                     checked={form.notifications}
                     onChange={(e) => handleChange("notifications", e.target.checked)}
                     className="peer sr-only"
                  />
                  <div className="w-12 h-6 bg-slate-700 rounded-full peer-checked:bg-indigo-500 transition-colors border border-slate-600 peer-checked:border-indigo-400"></div>
                  <div className="absolute left-1 w-4 h-4 bg-slate-400 rounded-full transition-transform peer-checked:translate-x-6 peer-checked:bg-white border border-slate-500 peer-checked:border-none shadow-sm"></div>
               </div>
               <div>
                  <p className="text-white font-medium group-hover:text-indigo-300 transition-colors">Enable Email Notifications</p>
                  <p className="text-slate-500 text-sm mt-0.5">Receive updates about announcements, assignments and grades.</p>
               </div>
            </label>

            <div className={`space-y-2 transition-opacity duration-300 ${!form.notifications ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
               <label className="text-sm font-medium text-slate-300">Email Digest Frequency</label>
               <div className="relative max-w-xs">
                  <select 
                     value={form.emailDigest}
                     onChange={(e) => handleChange("emailDigest", e.target.value)}
                     disabled={!form.notifications}
                     className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                  >
                     <option value="daily">Daily</option>
                     <option value="weekly">Weekly</option>
                     <option value="monthly">Monthly</option>
                     <option value="off">Off</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
               </div>
            </div>
         </div>
         <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-end">
          <button 
            disabled={loading}
            onClick={handleSave}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-70 border border-slate-600"
          >
            Update Preferences
          </button>
         </div>
      </div>
    </div>
  );
}
