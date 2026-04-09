const fs = require('fs');

const userPath = 'src/pages/Users.jsx';
let userContent = fs.readFileSync(userPath, 'utf8');

// Update Users.jsx imports to have modal logic or fetch courses.
if (!userContent.includes('AssignCourseModal')) {
    userContent = userContent.replace('import { fetchUsers } from "../api/mockApi";', `import { fetchUsers } from "../api/mockApi";\nimport { fetchCourses } from "../api/mockApi";`);
    
    // add modal state
    userContent = userContent.replace('const [error, setError] = useState(null);', `const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [courseId, setCourseId] = useState("");
  `);

    // fetch courses
    userContent = userContent.replace('fetchUsers()', `fetchCourses().then(c => setCourses(c||[]));\n    fetchUsers()`);

    // Assign action method
    userContent = userContent.replace('return () => { cancelled = true; };\n  }, []);', `return () => { cancelled = true; };
  }, []);

  const handleAssign = async (e) => {
      e.preventDefault();
      if(!courseId || !selectedUser) return;
      setAssigning(true);
      try {
          await fetch('http://localhost:8080/api/enrollments', {
             method: 'POST', headers: {'Content-Type':'application/json'},
             body: JSON.stringify({studentId: selectedUser.id || Math.floor(Math.random()*100), courseId: parseInt(courseId), status: 'active'})
          });
          alert('Successfully assigned course!');
          setSelectedUser(null);
          setCourseId("");
      } catch(err) {
          alert('Failed to assign');
      } finally {
          setAssigning(false);
      }
  };
`);

   // Add Assign Course button in table, next to joinedAt
   userContent = userContent.replace('<td className="py-4 px-6 sm:px-4 text-right text-slate-400 whitespace-nowrap text-sm">\n                              {user.joinedAt}\n                           </td>', `<td className="py-4 px-6 sm:px-4 text-right text-slate-400 whitespace-nowrap text-sm">
                              {user.joinedAt}
                           </td>
                           <td className="py-4 px-6 sm:px-4 text-right">
                              <button onClick={() => setSelectedUser(user)} className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">Assign Course</button>
                           </td>`);
   userContent = userContent.replace('<th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Joined</th>', `<th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Joined</th>
                     <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Action</th>`);
                     
   // Add Modal markup at the end before </div>   );
   userContent = userContent.replace('    </div>\n  );\n}', `
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <form onSubmit={handleAssign} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 max-w-sm w-full">
              <h3 className="text-xl font-bold text-white mb-4">Assign Course to {selectedUser.name}</h3>
              <div className="mb-4">
                 <label className="text-slate-400 text-sm mb-1 block">Select Course</label>
                 <select required value={courseId} onChange={e=>setCourseId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white">
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                 </select>
              </div>
              <div className="flex justify-end gap-3">
                 <button type="button" onClick={()=>setSelectedUser(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                 <button type="submit" disabled={assigning} className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50">{assigning ? 'Assigning...' : 'Assign'}</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
}`);

   fs.writeFileSync(userPath, userContent);
   console.log('Patched Users.jsx');
}
