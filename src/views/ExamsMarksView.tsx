import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Calendar,
  X
} from 'lucide-react';
import { Examination, MarkRecord, Student, Subject } from '../types';
import { addExam, addMark, updateMark } from '../services/dataService';

interface ExamsMarksViewProps {
  exams: Examination[];
  marks: MarkRecord[];
  students: Student[];
  subjects: Subject[];
  userRole: string;
  onRefresh: () => void;
  onOpenAI: () => void;
}

export const ExamsMarksView: React.FC<ExamsMarksViewProps> = ({
  exams,
  marks,
  students,
  subjects,
  userRole,
  onRefresh,
  onOpenAI,
}) => {
  const [activeTab, setActiveTab] = useState<'marks' | 'exams'>('marks');
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || 'exam-1');
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showAddMarkModal, setShowAddMarkModal] = useState(false);

  // New exam form
  const [examForm, setExamForm] = useState<Partial<Examination>>({
    examId: `EXM-${Date.now().toString().slice(-4)}`,
    examName: '',
    examType: 'Internal',
    subjectCode: subjects[0]?.code || 'CS801',
    subjectName: subjects[0]?.name || 'Machine Learning',
    department: 'CSE',
    semester: 8,
    section: 'A',
    date: new Date().toISOString().split('T')[0],
    maxMarks: 40,
    passingMarks: 16,
  });

  // New mark form
  const [markForm, setMarkForm] = useState<Partial<MarkRecord>>({
    examId: exams[0]?.id || 'exam-1',
    examName: exams[0]?.examName || 'Internal Assessment I',
    studentId: students[0]?.studentId || 'CSE2026001',
    studentName: `${students[0]?.firstName} ${students[0]?.lastName}`,
    subjectCode: 'CS801',
    subjectName: 'Machine Learning',
    marksObtained: 35,
    maxMarks: 40,
    assignmentMarks: 18,
    internalMarks: 35,
    percentage: 87.5,
    grade: 'A',
    status: 'Pass',
    remarks: 'Good grasp of concepts',
    updatedAt: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grade calculator helper
  const calculateGradeAndStatus = (obtained: number, max: number) => {
    const pct = (obtained / max) * 100;
    let grade = 'F';
    let status: 'Pass' | 'Fail' = 'Fail';

    if (pct >= 90) grade = 'O';
    else if (pct >= 80) grade = 'A+';
    else if (pct >= 70) grade = 'A';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 40) grade = 'P';

    if (pct >= 40) status = 'Pass';

    return { percentage: Math.round(pct * 10) / 10, grade, status };
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sub = subjects.find((s) => s.code === examForm.subjectCode);
      await addExam({
        ...examForm,
        subjectName: sub?.name || examForm.subjectName || 'Subject',
      } as Omit<Examination, 'id'>);

      setShowAddExamModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error creating exam: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedStudent = students.find((s) => s.studentId === markForm.studentId);
      const selectedExam = exams.find((ex) => ex.id === markForm.examId);
      const { percentage, grade, status } = calculateGradeAndStatus(
        markForm.marksObtained || 0,
        selectedExam?.maxMarks || 40
      );

      await addMark({
        ...markForm,
        studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : markForm.studentName || '',
        examName: selectedExam?.examName || 'Assessment',
        subjectCode: selectedExam?.subjectCode || 'CS801',
        subjectName: selectedExam?.subjectName || 'Machine Learning',
        maxMarks: selectedExam?.maxMarks || 40,
        percentage,
        grade,
        status,
        updatedAt: new Date().toISOString().split('T')[0],
      } as Omit<MarkRecord, 'id'>);

      setShowAddMarkModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error recording marks: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Examinations & Marks Registry
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Internal assessments, mid-terms, final semester marks computation, and automatic grade classification.
          </p>
        </div>

        {userRole !== 'student' && userRole !== 'parent' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddExamModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exam</span>
            </button>
            <button
              onClick={() => setShowAddMarkModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enter Marks</span>
            </button>
          </div>
        )}
      </div>

      {/* Toggle View Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('marks')}
          className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'marks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Recorded Student Marks
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'exams'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Scheduled Examinations ({exams.length})
        </button>
      </div>

      {/* Marks View */}
      {activeTab === 'marks' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Exam Name</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Marks Obtained</th>
                  <th className="px-5 py-3.5">Percentage</th>
                  <th className="px-5 py-3.5">Grade</th>
                  <th className="px-5 py-3.5">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      No marks recorded yet.
                    </td>
                  </tr>
                ) : (
                  marks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900">{m.studentName}</p>
                        <span className="text-[11px] font-mono text-indigo-600">{m.studentId}</span>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {m.examName}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        <p className="font-semibold text-slate-800">{m.subjectName}</p>
                        <span className="text-[11px] text-slate-400">{m.subjectCode}</span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                        {m.marksObtained} <span className="text-slate-400 text-xs font-normal">/ {m.maxMarks}</span>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        {m.percentage}%
                      </td>

                      <td className="px-5 py-3.5 font-bold text-indigo-600">
                        {m.grade}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            m.status === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exams Schedule View */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((ex) => (
            <div key={ex.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  {ex.examType} Exam
                </span>
                <span className="text-xs text-slate-400 font-mono">{ex.examId}</span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{ex.examName}</h3>
                <p className="text-xs text-slate-600">{ex.subjectName} ({ex.subjectCode})</p>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div>
                  <span className="block text-slate-400">Date</span>
                  <span className="font-semibold text-slate-800">{ex.date}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Max Marks</span>
                  <span className="font-semibold text-slate-800">{ex.maxMarks} (Pass: {ex.passingMarks})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Schedule New Examination</h3>
              <button onClick={() => setShowAddExamModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Examination Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid Semester Finals"
                  value={examForm.examName}
                  onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Exam Type</label>
                  <select
                    value={examForm.examType}
                    onChange={(e) => setExamForm({ ...examForm, examType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Internal">Internal</option>
                    <option value="Mid">Mid Term</option>
                    <option value="Semester">Semester Finals</option>
                    <option value="Model">Model Exam</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Subject</label>
                  <select
                    value={examForm.subjectCode}
                    onChange={(e) => setExamForm({ ...examForm, subjectCode: e.target.value })}
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
                  <label className="font-semibold text-slate-600">Date</label>
                  <input
                    type="date"
                    required
                    value={examForm.date}
                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Max Marks</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={examForm.maxMarks}
                    onChange={(e) => setExamForm({ ...examForm, maxMarks: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Examination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Marks Modal */}
      {showAddMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Enter Student Exam Mark</h3>
              <button onClick={() => setShowAddMarkModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMark} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Examination</label>
                <select
                  value={markForm.examId}
                  onChange={(e) => setMarkForm({ ...markForm, examId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.examName} ({ex.subjectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Student</label>
                <select
                  value={markForm.studentId}
                  onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.studentId}>
                      {stu.studentId} - {stu.firstName} {stu.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Marks Obtained</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={markForm.marksObtained}
                    onChange={(e) => setMarkForm({ ...markForm, marksObtained: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent work"
                    value={markForm.remarks}
                    onChange={(e) => setMarkForm({ ...markForm, remarks: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMarkModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {isSubmitting ? 'Recording...' : 'Record Mark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
