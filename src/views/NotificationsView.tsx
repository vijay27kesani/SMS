import React, { useState } from 'react';
import {
  Bell,
  Plus,
  AlertTriangle,
  Megaphone,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { NotificationItem } from '../types';
import { addNotification } from '../services/dataService';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  userRole: string;
  onRefresh: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  userRole,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState('All');

  const [form, setForm] = useState<Partial<NotificationItem>>({
    title: '',
    message: '',
    type: 'General Announcement',
    targetRole: 'all',
    targetDepartment: 'All',
    author: 'Dean of Academic Affairs',
    date: new Date().toISOString().split('T')[0],
    isImportant: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredNotifs = notifications.filter(
    (n) => filterType === 'All' || n.type === filterType
  );

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addNotification(form as Omit<NotificationItem, 'id'>);
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error posting announcement: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Campus Announcements & Notices
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Publish examination reminders, attendance advisories, academic symposiums, and circulars.
          </p>
        </div>

        {userRole !== 'student' && userRole !== 'parent' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          'All',
          'Exam Notification',
          'Assignment Notification',
          'Attendance Warning',
          'Fee Reminder',
          'Event Notification',
        ].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === type
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Notice Feed */}
      <div className="space-y-3">
        {filteredNotifs.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-2xl border transition-all ${
              n.isImportant
                ? 'bg-amber-50/70 border-amber-200 text-slate-900'
                : 'bg-white border-slate-200/80 text-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                    n.isImportant
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {n.type}
                </span>
                <span className="text-xs font-semibold text-slate-400">Target: {n.targetRole}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{n.date}</span>
            </div>

            <h3 className="font-bold text-slate-900 text-base mt-2">{n.title}</h3>
            <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Author: <strong className="text-slate-700">{n.author}</strong></span>
              {n.isImportant && (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> High Priority Circular
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Post Campus Notice</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePost} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Notice Heading</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-term practical exam schedule"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Notice Category</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="General Announcement">General Announcement</option>
                    <option value="Exam Notification">Exam Notification</option>
                    <option value="Assignment Notification">Assignment Notification</option>
                    <option value="Attendance Warning">Attendance Warning</option>
                    <option value="Fee Reminder">Fee Reminder</option>
                    <option value="Event Notification">Event Notification</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Target Audience</label>
                  <select
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="all">Entire Institution</option>
                    <option value="students">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                    <option value="parents">Parents Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Notice Body</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed announcement text..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="important-box"
                  checked={form.isImportant}
                  onChange={(e) => setForm({ ...form, isImportant: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="important-box" className="font-semibold text-slate-700 cursor-pointer">
                  Mark as Urgent / Priority Banner
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {isSubmitting ? 'Posting...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
