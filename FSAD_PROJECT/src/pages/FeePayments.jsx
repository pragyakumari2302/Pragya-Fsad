import { useState, useEffect } from "react";
import { IndianRupee, CreditCard, Download, CheckCircle, Clock, UserPlus } from "lucide-react";
import { fetchFeeItems, fetchFeePayments, fetchFeePaymentsByStudent, createFeePayment, updateFeePayment } from "../api/mockApi";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

export default function FeePayments() {
  const { user } = useAuth();

  // Teachers cannot access fees (FIX 1, 5)
  if (user?.role === "Teacher") {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 text-center max-w-md">
          Fee management is not available for teachers. Please contact an administrator for fee-related queries.
        </p>
      </div>
    );
  }

  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ feeItemId: "", amountPaid: "", method: "online", transactionId: "" });
  const [assignForm, setAssignForm] = useState({ studentId: "", feeItemId: "", amountPaid: "" });

  const isAdmin = user?.role === "Admin";

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [feeItems, feePayments] = await Promise.all([
        fetchFeeItems(),
        isAdmin ? fetchFeePayments() : fetchFeePaymentsByStudent(user.id)
      ]);
      setItems(feeItems || []);
      setPayments(feePayments || []);
    } catch (err) {
      setError(err?.message || "Failed to load fee payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadPayments();
  }, [user?.id, user?.role]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const itemLookup = new Map(items.map((item) => [item.id, item]));
  const totalFees = payments.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0);
  const paidAmount = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0);
  const pendingAmount = Math.max(totalFees - paidAmount, 0);

  const handlePaySubmit = async (event) => {
    event.preventDefault();
    if (!paymentForm.feeItemId || !paymentForm.amountPaid) return;
    setSaving(true);
    try {
      await createFeePayment({
        studentId: user.id,
        feeItemId: Number(paymentForm.feeItemId),
        amountPaid: Number(paymentForm.amountPaid),
        method: paymentForm.method,
        transactionId: paymentForm.transactionId || null,
        status: "pending"
      });
      setShowPayModal(false);
      setPaymentForm({ feeItemId: "", amountPaid: "", method: "online", transactionId: "" });
      await loadPayments();
    } catch (err) {
      setError(err?.message || "Failed to submit payment");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSubmit = async (event) => {
    event.preventDefault();
    if (!assignForm.studentId || !assignForm.feeItemId) return;
    setSaving(true);
    try {
      const item = itemLookup.get(Number(assignForm.feeItemId));
      await createFeePayment({
        studentId: Number(assignForm.studentId),
        feeItemId: Number(assignForm.feeItemId),
        amountPaid: Number(assignForm.amountPaid || item?.amount || 0),
        method: "admin",
        status: "pending"
      });
      setShowAssignModal(false);
      setAssignForm({ studentId: "", feeItemId: "", amountPaid: "" });
      await loadPayments();
    } catch (err) {
      setError(err?.message || "Failed to assign fee");
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (paymentId) => {
    setVerifyLoading(paymentId);
    try {
      await updateFeePayment(paymentId, { status: "paid", paidAt: new Date().toISOString().slice(0, 10) });
      await loadPayments();
    } catch (err) {
      setError(err?.message || "Failed to verify payment");
    } finally {
      setVerifyLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Fee Payments</h1>
          <p className="text-slate-400 mt-1">Managed by the admin with student submissions</p>
        </div>
        {isAdmin ? (
          <button onClick={() => setShowAssignModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Assign Fee</span>
          </button>
        ) : (
          <button onClick={() => setShowPayModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Pay Fees</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-white/5 shrink-0">
               <IndianRupee className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Fees</p>
               <p className="text-2xl font-bold text-white leading-none">Rs. {totalFees.toLocaleString()}</p>
            </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-white/5 shrink-0">
               <CheckCircle className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Paid Amount</p>
               <p className="text-2xl font-bold text-emerald-400 leading-none">Rs. {paidAmount.toLocaleString()}</p>
            </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-white/5 shrink-0">
               <Clock className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Pending Amount</p>
               <p className="text-2xl font-bold text-rose-400 leading-none">Rs. {pendingAmount.toLocaleString()}</p>
            </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-0 sm:p-6 border border-slate-700 shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold text-white mb-6 px-6 sm:px-0 pt-6 sm:pt-0">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Fee Item</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Semester</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Amount</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Paid At</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Transaction</th>
                <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Status</th>
                {isAdmin && (
                  <th className="pb-3 px-6 sm:px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {payments.map((payment) => {
                const item = itemLookup.get(payment.feeItemId);
                const status = payment.status === "paid" ? "Paid" : "Pending";
                return (
                  <tr key={payment.id} className="group hover:bg-slate-700/50 hover:scale-[1.01] transition-all duration-200">
                    <td className="py-4 px-6 sm:px-4 font-semibold text-slate-200 whitespace-nowrap">
                       {item?.name || "Fee Item"}
                    </td>
                    <td className="py-4 px-6 sm:px-4 text-slate-300 whitespace-nowrap">
                       {item?.semester || "-"}
                    </td>
                    <td className="py-4 px-6 sm:px-4 text-slate-300 font-medium">
                       Rs. {Number(payment.amountPaid || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 sm:px-4 text-slate-400">
                       {payment.paidAt || "-"}
                    </td>
                    <td className="py-4 px-6 sm:px-4 text-slate-400">
                       {payment.transactionId || "-"}
                    </td>
                    <td className="py-4 px-6 sm:px-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        status === "Paid" 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {status === "Paid" ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-6 sm:px-4 text-right">
                        {status === "Pending" ? (
                          <button
                            onClick={() => handleVerify(payment.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10 transition-colors"
                            disabled={verifyLoading === payment.id}
                          >
                            {verifyLoading === payment.id ? "Verifying..." : "Verify"}
                          </button>
                        ) : (
                          <button className="text-indigo-400 hover:text-indigo-300 transition-colors p-1.5 hover:bg-indigo-500/10 rounded-lg">
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-10 text-center text-slate-500 italic">No payment records assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handlePaySubmit} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-extrabold text-white mb-6">Submit Fee Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Fee Item</label>
                <select
                  value={paymentForm.feeItemId}
                  onChange={(e) => {
                    const selected = e.target.value;
                    const item = itemLookup.get(Number(selected));
                    setPaymentForm((prev) => ({ ...prev, feeItemId: selected, amountPaid: item ? String(item.amount) : prev.amountPaid }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                  required
                >
                  <option value="">Select fee item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} ({item.semester})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Amount Paid</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, amountPaid: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, method: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                >
                  <option value="online">Online</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Transaction ID</label>
                <input
                  type="text"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, transactionId: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowPayModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50">
                {saving ? "Saving..." : "Submit Payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleAssignSubmit} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-extrabold text-white mb-6">Assign Fee to Student</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Student ID</label>
                <input
                  type="number"
                  min="1"
                  value={assignForm.studentId}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, studentId: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Fee Item</label>
                <select
                  value={assignForm.feeItemId}
                  onChange={(e) => {
                    const selected = e.target.value;
                    const item = itemLookup.get(Number(selected));
                    setAssignForm((prev) => ({ ...prev, feeItemId: selected, amountPaid: item ? String(item.amount) : prev.amountPaid }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                  required
                >
                  <option value="">Select fee item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} ({item.semester})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold mb-2 block uppercase tracking-wider">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={assignForm.amountPaid}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, amountPaid: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowAssignModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 disabled:opacity-50">
                {saving ? "Assigning..." : "Assign Fee"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
