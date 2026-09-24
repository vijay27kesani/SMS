import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Receipt,
  Search,
  Filter,
  X
} from 'lucide-react';
import { FeeRecord, Student } from '../types';
import { updateFee, addFee } from '../services/dataService';

interface FeesViewProps {
  fees: FeeRecord[];
  students: Student[];
  userRole: string;
  onRefresh: () => void;
}

export const FeesView: React.FC<FeesViewProps> = ({
  fees,
  students,
  userRole,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalCollected = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalPending = fees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0);

  const filteredFees = fees.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || f.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || paymentAmount <= 0) return;

    setIsProcessing(true);
    try {
      const newPaid = selectedFee.paidAmount + paymentAmount;
      const newPending = Math.max(0, selectedFee.totalFee - newPaid);
      const newStatus = newPending === 0 ? 'Paid' : 'Partially Paid';

      await updateFee(selectedFee.id, {
        paidAmount: newPaid,
        pendingAmount: newPending,
        paymentStatus: newStatus,
        lastPaymentDate: new Date().toISOString().split('T')[0],
      });

      setSelectedFee(null);
      setPaymentAmount(0);
      onRefresh();
    } catch (err: any) {
      alert(`Error updating fee: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Fee Management
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Tuition accounts, examination charges, hostel balances, and payment-status monitoring.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Billed Fees</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              ₹{(totalCollected + totalPending).toLocaleString()}
            </p>
            <span className="text-xs text-slate-400">Academic Year 2025-2026</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Cleared</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ₹{totalCollected.toLocaleString()}
            </p>
            <span className="text-xs text-emerald-600 font-medium">Cleared to Treasury</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Outstanding Dues</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              ₹{totalPending.toLocaleString()}
            </p>
            <span className="text-xs text-amber-600 font-medium">Requires clearance</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 outline-hidden w-full md:w-auto"
        >
          <option value="All">All Payment Statuses</option>
          <option value="Paid">Fully Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      {/* Fee Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Student ID & Name</th>
                <th className="px-5 py-3.5">Tuition & Exam Fees</th>
                <th className="px-5 py-3.5">Hostel & Misc</th>
                <th className="px-5 py-3.5">Total Dues</th>
                <th className="px-5 py-3.5">Paid Amount</th>
                <th className="px-5 py-3.5">Pending Dues</th>
                <th className="px-5 py-3.5">Status</th>
                {userRole !== 'student' && userRole !== 'parent' && (
                  <th className="px-5 py-3.5 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{f.studentName}</p>
                    <span className="text-[11px] font-mono text-indigo-600">{f.studentId} • {f.department}</span>
                  </td>

                  <td className="px-5 py-3.5">
                    ₹{f.tuitionFee.toLocaleString()} + ₹{f.examFee.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5">
                    ₹{(f.hostelFee + f.transportFee + f.libraryFee).toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    ₹{f.totalFee.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5 font-semibold text-emerald-600">
                    ₹{f.paidAmount.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5 font-bold text-amber-600">
                    ₹{f.pendingAmount.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        f.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.paymentStatus === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {f.paymentStatus}
                    </span>
                  </td>

                  {userRole !== 'student' && userRole !== 'parent' && (
                    <td className="px-5 py-3.5 text-right">
                      {f.pendingAmount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedFee(f);
                            setPaymentAmount(f.pendingAmount);
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Record Receipt
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Record Payment for {selectedFee.studentName}
              </h3>
              <button onClick={() => setSelectedFee(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedFee.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Bill:</span>
                  <span className="font-bold text-slate-800">₹{selectedFee.totalFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Already Paid:</span>
                  <span className="font-bold text-emerald-600">₹{selectedFee.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Outstanding Balance:</span>
                  <span className="font-bold text-amber-600">₹{selectedFee.pendingAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Payment Amount to Record (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedFee.pendingAmount}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedFee(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {isProcessing ? 'Updating...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
