import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Award,
  CalendarCheck,
  CreditCard,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';
import { Student, Faculty, Department, AttendanceRecord, MarkRecord, Assignment, FeeRecord, TimetableEntry } from '../types';

interface DashboardProps {
  role: string;
  students: Student[];
  faculty: Faculty[];
  departments: Department[];
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
  assignments: Assignment[];
  fees: FeeRecord[];
  timetable: TimetableEntry[];
  onNavigate: (tab: string) => void;
  onOpenAI: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  role,
  students,
  faculty,
  departments,
  attendance,
  marks,
  assignments,
  fees,
  timetable,
  onNavigate,
  onOpenAI,
}) => {
  // Common calculation helpers
  const totalStudents = students.length;
  const totalFaculty = faculty.length;
  const totalDepartments = departments.length;

  // Attendance metrics
  const totalAttRecords = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const avgAttendance = totalAttRecords > 0 ? Math.round((presentCount / totalAttRecords) * 100) : 88;

  // Fee metrics
  const totalFeeCollected = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalFeePending = fees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0);

  // At-risk students (attendance below 75%)
  const lowAttendanceStudents = students.filter((stu) => {
    const stuAtt = attendance.filter((a) => a.studentId === stu.studentId);
    if (stuAtt.length === 0) return false;
    const attended = stuAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    return (attended / stuAtt.length) * 100 < 75;
  });

  // RENDER: Admin Dashboard
  if (role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Institutional Operations Hub
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Apex University Administration
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Centralized intelligence managing {totalStudents} enrolled students, {totalFaculty} faculty researchers, and {totalDepartments} accredited departments.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAI}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Ask Gemini Institutional Assistant
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold rounded-xl transition-all"
              >
                View Dean Reports
              </button>
            </div>
          </div>
        </div>

        {/* Key KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
              <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> 100% active roster
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty Members</span>
              <p className="text-2xl font-bold text-slate-900">{totalFaculty}</p>
              <span className="text-[11px] text-indigo-600 font-medium">8 Departments/Labs</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Attendance</span>
              <p className="text-2xl font-bold text-slate-900">{avgAttendance}%</p>
              <span className="text-[11px] text-emerald-600 font-medium">Above 75% target</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Collection</span>
              <p className="text-2xl font-bold text-slate-900">₹{(totalFeeCollected / 1000).toFixed(0)}k</p>
              <span className="text-[11px] text-amber-600 font-medium">
                Pending: ₹{(totalFeePending / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* AI Early Warning Attendance Alert Card */}
        {lowAttendanceStudents.length > 0 && (
          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-rose-900">
                  AI Attendance Intervention Alert ({lowAttendanceStudents.length} Students At Risk)
                </h3>
              </div>
              <button
                onClick={onOpenAI}
                className="text-xs font-semibold text-rose-700 bg-white px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Analyze with Gemini
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowAttendanceStudents.map((s) => {
                const stuAtt = attendance.filter((a) => a.studentId === s.studentId);
                const attended = stuAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
                const pct = stuAtt.length > 0 ? ((attended / stuAtt.length) * 100).toFixed(1) : '0';

                return (
                  <div key={s.id} className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{s.firstName} {s.lastName}</p>
                      <p className="text-[11px] text-slate-500">{s.studentId} • {s.department}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600 text-sm">{pct}%</span>
                      <p className="text-[10px] text-rose-500 font-medium">Critical</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Secondary Grid: Department Enrollment & Recent Examination Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Department Status</h3>
              <button onClick={() => onNavigate('academics')} className="text-xs text-indigo-600 hover:underline font-semibold">
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {departments.map((dept) => {
                const deptStuCount = students.filter((s) => s.department === dept.code).length;
                const deptFacCount = faculty.filter((f) => f.department === dept.code).length;

                return (
                  <div key={dept.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {dept.code}
                      </span>
                      <h4 className="font-semibold text-slate-800 text-sm mt-1">{dept.name}</h4>
                      <p className="text-xs text-slate-500">HOD: {dept.hodName}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-sm font-bold text-slate-800">{deptStuCount} Students</p>
                      <p className="text-xs text-slate-500">{deptFacCount} Faculty</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Academic Marks Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Exam Results</h3>
              <button onClick={() => onNavigate('exams')} className="text-xs text-indigo-600 hover:underline font-semibold">
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {marks.slice(0, 4).map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{m.studentName}</p>
                    <p className="text-slate-500 text-[11px]">{m.subjectName} ({m.subjectCode}) • {m.examName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      m.status === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {m.marksObtained}/{m.maxMarks} (Grade {m.grade})
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{m.updatedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Faculty Dashboard
  if (role === 'faculty') {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
              Faculty Academic Console
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">Welcome, Dr. Aris Thorne</h2>
            <p className="text-slate-300 text-sm">
              Department of Computer Science & Engineering • Assigned to CS801 (Machine Learning) & CS804 (Capstone).
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => onNavigate('attendance')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Mark Today's Attendance
              </button>
              <button
                onClick={onOpenAI}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Ask Class Assistant
              </button>
            </div>
          </div>
        </div>

        {/* Faculty stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">My Students</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{students.filter((s) => s.department === 'CSE').length}</p>
            <span className="text-xs text-slate-500">CSE Section A & B</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Active Assignments</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{assignments.length}</p>
            <span className="text-xs text-indigo-600 font-medium">Submissions pending review</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Average Class Marks</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">79.4%</p>
            <span className="text-xs text-emerald-600 font-medium">Internal Assessment 1</span>
          </div>
        </div>

        {/* Timetable schedule for today */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Today's Class Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {timetable.slice(0, 2).map((tt) => (
              <div key={tt.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600">{tt.startTime} - {tt.endTime}</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">{tt.subjectName}</h4>
                  <p className="text-xs text-slate-500">{tt.room} • Section {tt.section}</p>
                </div>
                <button
                  onClick={() => onNavigate('attendance')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Mark Roll
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Student Dashboard
  if (role === 'student') {
    const studentId = 'CSE2026001';
    const myAtt = attendance.filter((a) => a.studentId === studentId);
    const presentTotal = myAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const myAttendancePct = myAtt.length > 0 ? Math.round((presentTotal / myAtt.length) * 100) : 92;

    const myMarks = marks.filter((m) => m.studentId === studentId);
    const myFee = fees.find((f) => f.studentId === studentId);

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-950 to-indigo-900 p-6 md:p-8 text-white shadow-xl">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
              Student Academic Dashboard
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">Welcome back, Vijay Kumar!</h2>
            <p className="text-slate-300 text-sm">
              CSE2026001 • B.Tech Computer Science & Engineering (Semester 8, Section A)
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={onOpenAI}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask Study Advisor
              </button>
              <button
                onClick={() => onNavigate('assignments')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl"
              >
                View Pending Tasks
              </button>
            </div>
          </div>
        </div>

        {/* Student metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">My Attendance</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{myAttendancePct}%</p>
            <span className="text-xs text-slate-500">Good Standing (Eligible for exams)</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Latest GPA / Grade</span>
            <p className="text-2xl font-bold text-indigo-600 mt-1">Grade A (86%)</p>
            <span className="text-xs text-slate-500">Internal Assessment 1</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Pending Tuition Due</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">₹{myFee?.pendingAmount.toLocaleString() || '15,000'}</p>
            <span className="text-xs text-slate-500">Due: Oct 15, 2026</span>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Today's Lectures</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {timetable.slice(0, 3).map((tt) => (
              <div key={tt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-xs font-bold text-indigo-600">{tt.startTime} - {tt.endTime}</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">{tt.subjectName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{tt.facultyName}</p>
                <p className="text-[11px] text-slate-400 mt-1">{tt.room}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Parent Dashboard
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
            Guardian & Parent Portal
          </span>
          <h2 className="text-2xl md:text-3xl font-bold">Academic Overview for Vijay Kumar</h2>
          <p className="text-slate-300 text-sm">
            Student ID: CSE2026001 • Department of Computer Science & Engineering
          </p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={onOpenAI}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Ask Parent Advisor
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl"
            >
              View Fee Details
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Attendance Standing</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">92.5%</p>
          <span className="text-xs text-slate-500">Excellent, above 75% minimum</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Current Performance</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">Grade A (Pass)</p>
          <span className="text-xs text-slate-500">Internal Assessment 1</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Pending Term Fees</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹15,000</p>
          <span className="text-xs text-slate-500">Due before final examinations</span>
        </div>
      </div>
    </div>
  );
};
