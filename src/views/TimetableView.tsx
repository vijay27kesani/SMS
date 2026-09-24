import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  Layers,
  X
} from 'lucide-react';
import { TimetableEntry, Subject, Faculty } from '../types';
import { addTimetableEntry } from '../services/dataService';

interface TimetableViewProps {
  timetable: TimetableEntry[];
  subjects: Subject[];
  faculty: Faculty[];
  userRole: string;
  onRefresh: () => void;
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  timetable,
  subjects,
  faculty,
  userRole,
  onRefresh,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedDept, setSelectedDept] = useState<string>('CSE');
  const [showAddModal, setShowAddModal] = useState(false);

  // New timetable entry form
  const [form, setForm] = useState<Partial<TimetableEntry>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    subjectCode: subjects[0]?.code || 'CS801',
    subjectName: subjects[0]?.name || 'Machine Learning',
    facultyName: faculty[0]?.facultyName || 'Dr. Aris Thorne',
    room: 'Lab 4, Block A',
    department: 'CSE',
    semester: 8,
    section: 'A',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const filteredEntries = timetable
    .filter((tt) => tt.day === selectedDay && (selectedDept === 'All' || tt.department === selectedDept))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sub = subjects.find((s) => s.code === form.subjectCode);
      await addTimetableEntry({
        ...form,
        subjectName: sub?.name || form.subjectName || 'Subject',
      } as Omit<TimetableEntry, 'id'>);
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error creating timetable slot: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Class Timetable & Lecture Hall Schedules
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Day-wise instructional schedule, assigned labs, and faculty room allocation.
          </p>
        </div>

        {userRole !== 'student' && userRole !== 'parent' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lecture Slot</span>
          </button>
        )}
      </div>

      {/* Day selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedDay === day
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Lecture Slots list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            No lectures scheduled for {selectedDay} in {selectedDept}.
          </div>
        ) : (
          filteredEntries.map((tt) => (
            <div
              key={tt.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:border-indigo-300 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono">
                  {tt.subjectCode}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Section {tt.section}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{tt.subjectName}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> {tt.facultyName}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium">{tt.startTime} - {tt.endTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-medium truncate">{tt.room}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Schedule New Lecture Slot</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Day of Week</label>
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Subject</label>
                  <select
                    value={form.subjectCode}
                    onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.code}>
                        {sub.code} - {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Start Time</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600">End Time</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Lecture Room / Lab</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 4, Block A"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Instructor Name</label>
                  <input
                    type="text"
                    required
                    value={form.facultyName}
                    onChange={(e) => setForm({ ...form, facultyName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
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
                  {isSubmitting ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
