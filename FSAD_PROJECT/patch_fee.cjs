const fs = require('fs');

const path = 'src/pages/FeePayments.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('setShowModal')) {
    content = content.replace('const [loading, setLoading] = useState(true);', `const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [paymentIdToVerify, setPaymentIdToVerify] = useState(null);`);

    content = content.replace('<CreditCard className="w-4 h-4" />\n          <span>Pay Fees</span>\n        </button>', `<CreditCard className="w-4 h-4" />
          <span>Add Payment Details</span>
        </button>`);
    content = content.replace('        <button className="', `        <button onClick={() => setShowModal(true)} className="`);

    content = content.replace('<td className="py-4 px-6 sm:px-4 text-right">\n                    <span className={`inline-flex items-center gap-1.5 px-3 py-1', `<td className="py-4 px-6 sm:px-4 text-right">
                    {payment.status === "Pending" && (
                        <button onClick={() => {
                            if (confirm("Admin: Verify and Approve payment?")) {
                               alert("Approved!");
                            }
                        }} className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded mr-2">Verify</button>
                    )}
                    <span className={\`inline-flex items-center gap-1.5 px-3 py-1`);

    content = content.replace('    </div>\n  );\n}', `
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <form onSubmit={e => { e.preventDefault(); alert('Payment details submitted for verification!'); setShowModal(false); setTxnId(""); }} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 max-w-sm w-full">
              <h3 className="text-xl font-bold text-white mb-4">Submit Payment Details</h3>
              <div className="mb-4">
                 <label className="text-slate-400 text-sm mb-1 block">Select Semester / Amount</label>
                 <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white mb-3">
                    <option value="">-- Choose Pending Term --</option>
                    <option value="Spring 2026 - Rs. 8000">Spring 2026 - Rs. 8000</option>
                    <option value="Spring 2026 - Rs. 12000">Spring 2026 - Rs. 12000</option>
                 </select>
                 <label className="text-slate-400 text-sm mb-1 block">Transaction ID (Bank / UPI)</label>
                 <input type="text" required value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder="e.g. TXN12345ABC" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white" />
              </div>
              <div className="flex justify-end gap-3">
                 <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 shadow-md">Submit</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
}`);

    fs.writeFileSync(path, content);
    console.log('Patched FeePayments.jsx');
}
