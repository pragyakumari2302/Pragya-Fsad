import { useState, useEffect } from "react";
import { Book, Library as LibraryIcon, Banknote, CalendarDays, Clock, CheckCircle, Search } from "lucide-react";
import Loader from "../components/ui/Loader";

export default function Library() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    setTimeout(() => {
      if (!cancelled) {
        setData({
          issuedBooks: [
            { id: 1, title: "Introduction to Algorithms", author: "Thomas H. Cormen", issueDate: "2026-02-10", dueDate: "2026-03-10", status: "Active" },
            { id: 2, title: "Operating Systems Concepts", author: "Abraham Silberschatz", issueDate: "2026-01-28", dueDate: "2026-02-28", status: "Active" },
            { id: 3, title: "Database Systems", author: "Ramakrishnan & Gehrke", issueDate: "2026-02-12", dueDate: "2026-03-12", status: "Active" },
            { id: 4, title: "Computer Networks", author: "Andrew S. Tanenbaum", issueDate: "2026-02-18", dueDate: "2026-03-18", status: "Active" }
          ],
          totalBooks: 4,
          libraryMemberId: "LIB-2026-041",
          fineDue: 0,
        });
        setLoading(false);
      }
    }, 500);

    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Library</h1>
          <p className="text-slate-400 mt-1">Manage your borrowed books and library account</p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span>Search Catalog</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-white/5 shrink-0">
               <LibraryIcon className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Member ID</p>
               <p className="text-xl font-bold text-white leading-none">{data?.libraryMemberId}</p>
            </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-white/5 shrink-0">
               <Book className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Active Books</p>
               <p className="text-2xl font-bold text-white leading-none">{data?.totalBooks}</p>
            </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center border border-white/5 shrink-0">
               <Banknote className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Fine Due</p>
               <p className="text-2xl font-bold text-green-400 leading-none">Rs. {data?.fineDue.toLocaleString()}</p>
            </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-0 sm:p-6 border border-slate-700 shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 sm:p-0 border-b border-slate-700/50 pb-4 mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Book className="text-indigo-400 w-5 h-5"/>
            Issued Books
          </h2>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Book Title & Author</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Issue Date</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Due Date</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {data?.issuedBooks.map((book) => (
                <tr key={book.id} className="group hover:bg-slate-700/50 hover:scale-[1.01] transition-all duration-200">
                  <td className="py-4 px-6 sm:px-4 whitespace-nowrap">
                     <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors mt-0.5 shrink-0">
                           <Book className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="font-semibold text-slate-200">{book.title}</p>
                           <p className="text-sm text-slate-400">{book.author}</p>
                        </div>
                     </div>
                  </td>
                  <td className="py-4 px-6 sm:px-4 whitespace-nowrap">
                     <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-300">{book.issueDate}</span>
                     </div>
                  </td>
                  <td className="py-4 px-6 sm:px-4 whitespace-nowrap">
                     <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-400">{book.dueDate}</span>
                     </div>
                  </td>
                  <td className="py-4 px-6 sm:px-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {book.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data?.issuedBooks.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-10 text-center text-slate-500 italic">No books currently issued.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
