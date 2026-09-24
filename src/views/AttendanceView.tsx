import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
  Users,
  ChevronDown,
  Save,
  Check
} from 'lucide-react';
import { Student, Subject, AttendanceRecord } from '../types';
import { batchMarkAttendance } from '../services/dataService';

interface AttendanceViewProps {
  students: Student[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  onRefresh: () => void;
  onOpenAI: () => void;
  userRole: string;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  subjects,
  attendance,
  onRefresh,
  onOpenAI,
  userRole,
}) => {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(subjects[0]?.code || 'CS801');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSection, setSelectedSection] = useState('A');
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeSubject = subjects.find((s) => s.code === selectedSubjectCode) || subjects[0];

  // Eligible students for the current subject/section
  const targetStudents = students.filter(
    (s) => s.department === (activeSubject?.department || 'CSE') && (selectedSection === 'All' || s.section === selectedSection)
  );

  // Mark roll status
  const setStatus = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAll = (status: 'Present' | 'Absent') => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'> = {};
    targetStudents.forEach((stu) => {
      updated[stu.studentId] = status;
    });
    setAttendanceSheet(updated);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const recordsToSave = targetStudents.map((stu) => ({
        studentId: stu.studentId,
        studentName: `${stu.firstName} ${stu.lastName}`,
        subjectCode: activeSubject.code,
        subjectName: activeSubject.name,
        department: stu.department,
        semester: stu.semester,
        section: stu.section,
        date: selectedDate,
        status: attendanceSheet[stu.studentId] || 'Present',
        recordedBy: 'Dr. Aris Thorne',
      }));

      await batchMarkAttendance(recordsToSave);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to save attendance: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Student specific attendance summary calculations
  const calculateStudentAttendanceSummary = (studentId: string) => {
    const records = attendance.filter((a) => a.studentId === studentId);
    const total = records.length;
    const present = records.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const absent = records.filter((a) => a.status === 'Absent').length;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '100.0';
    return { total, present, absent, pct: parseFloat(pct) };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Attendance Tracking & Analytics
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Real-time roll-call recording, automated percentage calculation, and Gemini intervention alerts.
          </p>
        </div>

        <button
          onClick={onOpenAI}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Ask Gemini: Low Attendance Filter</span>
        </button>
      </div>

      {/* Control panel: Select Subject, Date, Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 font-medium outline-hidden"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.code}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Lecture Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 font-medium outline-hidden"
            >
            </input>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 font-medium outline-hidden"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="All">All Sections</option>
            </select>
          </div>
        </div>

        {/* Quick Batch Tools */}
        {userRole !== 'student' && userRole !== 'parent' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAll('Present')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll('Absent')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
            >
              Mark All Absent
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Submitting...' : 'Save Roll-Call'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Attendance Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            {activeSubject?.name} ({activeSubject?.code}) — Attendance Registry
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {targetStudents.length} Students on class roster
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Roll No. / Student</th>
                <th className="px-5 py-3.5">Total Attended</th>
                <th className="px-5 py-3.5">Absences</th>
                <th className="px-5 py-3.5">Cumulative Attendance %</th>
                <th className="px-5 py-3.5">Health Status</th>
                <th className="px-5 py-3.5 text-right">Mark Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {targetStudents.map((stu) => {
                const summary = calculateStudentAttendanceSummary(stu.studentId);
                const currentStatus = attendanceSheet[stu.studentId] || 'Present';
                const isCritical = summary.pct < 75;

                return (
                  <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{stu.firstName} {stu.lastName}</p>
                      <span className="text-[11px] font-mono text-slate-400">{stu.studentId} • Sec {stu.section}</span>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {summary.present} / {summary.total} classes
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {summary.absent} classes
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-rose-500' : summary.pct < 85 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, summary.pct)}%` }}
                          />
                        </div>
                        <span className={`font-bold text-xs ${isCritical ? 'text-rose-600' : 'text-slate-800'}`}>
                          {summary.pct}%
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {isCritical ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          Critical (&lt;75%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Satisfactory
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {userRole === 'student' || userRole === 'parent' ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                          {currentStatus}
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          {(['Present', 'Absent', 'Late', 'Leave'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => setStatus(stu.studentId, st)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                                currentStatus === st
                                  ? st === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
