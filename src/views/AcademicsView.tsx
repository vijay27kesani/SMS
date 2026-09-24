import React, { useState } from 'react';
import {
  School,
  BookOpen,
  Plus,
  Users,
  Award,
  Layers,
  Search,
  X
} from 'lucide-react';
import { Department, Course, Subject, Faculty } from '../types';
import { addDepartment, addCourse, addSubject } from '../services/dataService';

interface AcademicsViewProps {
  departments: Department[];
  courses: Course[];
  subjects: Subject[];
  faculty: Faculty[];
  userRole: string;
  onRefresh: () => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({
  departments,
  courses,
  subjects,
  faculty,
  userRole,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'departments' | 'courses' | 'subjects'>('departments');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  const [subjectForm, setSubjectForm] = useState<Partial<Subject>>({
    code: '',
    name: '',
    department: 'CSE',
    credits: 4,
    semester: 8,
    facultyName: faculty[0]?.facultyName || 'Dr. Aris Thorne',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addSubject(subjectForm as Omit<Subject, 'id'>);
      setShowAddSubjectModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error adding subject: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Curriculum & Departments
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Degree programs, departmental affiliations, and credited subject curricula.
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course / Subject</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'departments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'courses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Undergraduate Programs ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Subject Curricula ({subjects.length})
        </button>
      </div>

      {/* Department Cards */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {departments.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                  {d.code}
                </span>
                <span className="text-xs text-slate-400">Est. 2010</span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{d.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Head of Department: {d.hodName}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                <p>Email: <span className="font-medium text-slate-800">{d.contactEmail}</span></p>
                <p>Phone: <span className="font-medium text-slate-800">{d.contactPhone}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses Cards */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700">
                {c.code}
              </span>
              <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
              <p className="text-xs text-slate-500">Department: {c.department}</p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Duration: <strong>{c.durationYears} Years</strong></span>
                <span>Semesters: <strong>{c.totalSemesters} Sems</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subjects Table */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Subject Code & Name</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Semester</th>
                  <th className="px-5 py-3.5">Credits</th>
                  <th className="px-5 py-3.5">Assigned Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{sub.name}</p>
                      <span className="text-[11px] font-mono text-indigo-600">{sub.code}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{sub.department}</td>
                    <td className="px-5 py-3.5">Semester {sub.semester}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{sub.credits} Credits</td>
                    <td className="px-5 py-3.5 text-slate-700">{sub.facultyName || 'Dr. Aris Thorne'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Academic Subject</h3>
              <button onClick={() => setShowAddSubjectModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS805"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cloud Computing"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Department</label>
                  <select
                    value={subjectForm.department}
                    onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="AI & DS">AI & DS</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
