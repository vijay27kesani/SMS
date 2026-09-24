import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  Calendar,
  X
} from 'lucide-react';
import { Assignment, Submission, Student, Subject } from '../types';
import { addAssignment, addSubmission, updateSubmission } from '../services/dataService';

interface AssignmentsViewProps {
  assignments: Assignment[];
  submissions: Submission[];
  students: Student[];
  subjects: Subject[];
  userRole: string;
  onRefresh: () => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  submissions,
  students,
  subjects,
  userRole,
  onRefresh,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // New assignment form
  const [asgForm, setAsgForm] = useState<Partial<Assignment>>({
    title: '',
    description: '',
    instructions: '',
    subjectCode: subjects[0]?.code || 'CS801',
    subjectName: subjects[0]?.name || 'Machine Learning',
    department: 'CSE',
    semester: 8,
    section: 'A',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxMarks: 20,
    facultyId: 'fac-101',
    facultyName: 'Dr. Aris Thorne',
    createdAt: new Date().toISOString().split('T')[0],
  });

  // Submission form for students
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sub = subjects.find((s) => s.code === asgForm.subjectCode);
      await addAssignment({
        ...asgForm,
        subjectName: sub?.name || asgForm.subjectName || 'Subject',
        createdAt: new Date().toISOString().split('T')[0],
      } as Omit<Assignment, 'id'>);

      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error creating assignment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setIsSubmitting(true);
    try {
      await addSubmission({
        assignmentId: selectedAssignment.id,
        studentId: 'CSE2026001',
        studentName: 'Vijay Kumar',
        submittedAt: new Date().toISOString().split('T')[0],
        content: submissionText,
        status: 'Submitted',
      });
      setShowSubmitModal(false);
      setSubmissionText('');
      onRefresh();
    } catch (err: any) {
      alert(`Error submitting assignment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Assignments & Coursework Hub
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Publish coursework prompts, set deadlines, upload guidelines, and review student code/reports.
          </p>
        </div>

        {userRole !== 'student' && userRole !== 'parent' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.map((asg) => {
          const mySub = submissions.find(
            (s) => s.assignmentId === asg.id && s.studentId === 'CSE2026001'
          );

          return (
            <div
              key={asg.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {asg.subjectCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Max: {asg.maxMarks} Marks</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{asg.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{asg.subjectName}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {asg.description}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Deadline:
                    </span>
                    <span className="font-bold text-slate-800">{asg.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Assigned By:</span>
                    <span className="font-medium text-slate-700">{asg.facultyName}</span>
                  </div>
                </div>
              </div>

              {/* Footer action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {mySub ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {mySub.status} {mySub.marksAwarded !== undefined && `(${mySub.marksAwarded}/${asg.maxMarks})`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Pending Submission
                  </span>
                )}

                {userRole === 'student' && !mySub && (
                  <button
                    onClick={() => {
                      setSelectedAssignment(asg);
                      setShowSubmitModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Submit Work
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Publish New Assignment</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNN Image Classification Project"
                  value={asgForm.title}
                  onChange={(e) => setAsgForm({ ...asgForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Subject</label>
                <select
                  value={asgForm.subjectCode}
                  onChange={(e) => setAsgForm({ ...asgForm, subjectCode: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.code}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Submission Deadline</label>
                  <input
                    type="date"
                    required
                    value={asgForm.deadline}
                    onChange={(e) => setAsgForm({ ...asgForm, deadline: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Maximum Marks</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={asgForm.maxMarks}
                    onChange={(e) => setAsgForm({ ...asgForm, maxMarks: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Problem Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the objectives and requirements..."
                  value={asgForm.description}
                  onChange={(e) => setAsgForm({ ...asgForm, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Submission Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Include GitHub link and PDF documentation..."
                  value={asgForm.instructions}
                  onChange={(e) => setAsgForm({ ...asgForm, instructions: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Coursework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Submit Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Submit: {selectedAssignment.title}
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <p className="font-semibold text-indigo-900">Instructions:</p>
                <p className="text-slate-600 mt-1">{selectedAssignment.instructions || selectedAssignment.description}</p>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Repository Link or Solution Text</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste GitHub URL, cloud folder, or summary explanation..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !submissionText.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Upload & Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
