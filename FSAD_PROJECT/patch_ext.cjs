const fs = require('fs');
const profilePath = 'src/pages/Profile.jsx';
let profileText = fs.readFileSync(profilePath, 'utf8');

if (!profileText.includes('handleChangePassword')) {
    profileText = profileText.replace('const auth = useAuth();', 'const { user, login } = useAuth();');
    
    // Comment out static user object
    profileText = profileText.replace('const user = {\n    name: "Alex Johnson",', '// const user = {\n    // name: "Alex Johnson",');
    
    // The previous replace for user object might not comment it all. Better string trick:
    profileText = profileText.replace(/const user = \{[\s\S]*?\};/, '/* $& */');

    profileText = profileText.replace('return (', `
  const [showPasswordModal, setShowPasswordModal] = React.useState(!!window.location.href.includes('showPasswordChange'));
  const [newPassword, setNewPassword] = React.useState('');
  const [savingPassword, setSavingPassword] = React.useState(false);
  
  const handleChangePassword = async (e) => {
      e.preventDefault();
      setSavingPassword(true);
      try {
          const res = await fetch(\`http://localhost:8080/api/users/\${user.id}/change-password\`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({newPassword})
          });
          if(res.ok) {
              alert('Password changed successfully!');
              login({...user, department: 'Computer Science'});
              setShowPasswordModal(false);
              setNewPassword('');
          } else {
              alert('Failed to change password. Please try again.');
          }
      } catch (err) {
          alert('Network Error');
      } finally {
          setSavingPassword(false);
      }
  };

  return (`);

    profileText = profileText.replace(/<button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 .*?>\s*<Edit3 className="w-4 h-4" \/>\s*<span>Edit Profile<\/span>\s*<\/button>/, `$&
          <button onClick={() => setShowPasswordModal(true)} className="px-5 py-2.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2 mt-3 sm:mt-0">Change Password</button>`);
    
    profileText = profileText.replace(/<\/div>\s*<\/div>\s*\)\;\s*\}/, `      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <form onSubmit={handleChangePassword} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-sm w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
              <h3 className="text-xl font-extrabold text-white mb-6">Change Password</h3>
              {user?.department === 'required-password-change' && (
                 <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-xl mb-4 text-sm font-medium border border-yellow-500/20 flex flex-col gap-2">
                    <p>⚠️ Welcome! Since this is your first login, please update your temporary password to continue.</p>
                 </div>
              )}
              <div className="mb-6">
                 <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">New Password</label>
                 <input type="password" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Minimum 4 characters" minLength="4" className="w-full bg-slate-900 border border-slate-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 rounded-xl px-4 py-3 text-white transition-all outline-none" />
              </div>
              <div className="flex justify-end gap-3">
                 {user?.department !== 'required-password-change' && (
                     <button type="button" onClick={()=>setShowPasswordModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
                 )}
                 <button type="submit" disabled={savingPassword} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-yellow-500/25 disabled:opacity-50 w-full sm:w-auto transition-all">{savingPassword ? 'Saving...' : 'Update Password'}</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
}`);

    fs.writeFileSync(profilePath, profileText);
    console.log("Patched Profile.jsx");
}