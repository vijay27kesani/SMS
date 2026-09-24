import React, { useState, useEffect } from 'react';
import {
  Student, Faculty, Department, Course, Subject,
  AttendanceRecord, Examination, MarkRecord, Assignment,
  Submission, FeeRecord, TimetableEntry, NotificationItem
} from './types';
import {
  getStudents, getFaculty, getDepartments, getCourses,
  getSubjects, getAttendance, getExams, getMarks,
  getAssignments, getSubmissions, getFees, getTimetable,
  getNotifications
} from './services/dataService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AIChatModal } from './components/AIChatModal';

// Views
import { DashboardView } from './views/DashboardView';
import { StudentManagementView } from './views/StudentManagementView';
import { FacultyView } from './views/FacultyView';
import { AcademicsView } from './views/AcademicsView';
import { AttendanceView } from './views/AttendanceView';
import { ExamsMarksView } from './views/ExamsMarksView';
import { AssignmentsView } from './views/AssignmentsView';
import { FeesView } from './views/FeesView';
import { TimetableView } from './views/TimetableView';
import { NotificationsView } from './views/NotificationsView';
import { ReportsView } from './views/ReportsView';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Institution State
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [exams, setExams] = useState<Examination[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadAllData = async () => {
    try {
      const [
        stu, fac, dep, cou, sub,
        att, exa, mar, asg, sbm,
        fee, ttb, not
      ] = await Promise.all([
        getStudents(),
        getFaculty(),
        getDepartments(),
        getCourses(),
        getSubjects(),
        getAttendance(),
        getExams(),
        getMarks(),
        getAssignments(),
        getSubmissions(),
        getFees(),
        getTimetable(),
        getNotifications(),
      ]);

      setStudents(stu);
      setFaculty(fac);
      setDepartments(dep);
      setCourses(cou);
      setSubjects(sub);
      setAttendance(att);
      setExams(exa);
      setMarks(mar);
      setAssignments(asg);
      setSubmissions(sbm);
      setFees(fee);
      setTimetable(ttb);
      setNotifications(not);
      setDataLoaded(true);
    } catch (e) {
      console.error('Error fetching university dataset:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAnalyzeStudent = (stu: Student) => {
    setAiModalOpen(true);
  };

  if (isLoading || !dataLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Loading Apex University AI Portal...
        </p>
      </div>
    );
  }

  const role = user?.role || 'admin';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAIChat={() => setAiModalOpen(true)}
          notifications={notifications}
          searchTerm={globalSearch}
          setSearchTerm={setGlobalSearch}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* View Router */}
            {currentTab === 'dashboard' && (
              <DashboardView
                role={role}
                students={students}
                faculty={faculty}
                departments={departments}
                attendance={attendance}
                marks={marks}
                assignments={assignments}
                fees={fees}
                timetable={timetable}
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenAI={() => setAiModalOpen(true)}
              />
            )}

            {currentTab === 'students' && (
              <StudentManagementView
                students={students}
                onRefresh={loadAllData}
                onAnalyzeStudent={handleAnalyzeStudent}
              />
            )}

            {currentTab === 'faculty' && (
              <FacultyView
                faculty={faculty}
                departments={departments}
                userRole={role}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'academics' && (
              <AcademicsView
                departments={departments}
                courses={courses}
                subjects={subjects}
                faculty={faculty}
                userRole={role}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'attendance' && (
              <AttendanceView
                students={students}
                subjects={subjects}
                attendance={attendance}
                onRefresh={loadAllData}
                onOpenAI={() => setAiModalOpen(true)}
                userRole={role}
              />
            )}

            {currentTab === 'exams' && (
              <ExamsMarksView
                exams={exams}
                marks={marks}
                students={students}
                subjects={subjects}
                userRole={role}
                onRefresh={loadAllData}
                onOpenAI={() => setAiModalOpen(true)}
              />
            )}

            {currentTab === 'assignments' && (
              <AssignmentsView
                assignments={assignments}
                submissions={submissions}
                students={students}
                subjects={subjects}
                userRole={role}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'fees' && (
              <FeesView
                fees={fees}
                students={students}
                userRole={role}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'timetable' && (
              <TimetableView
                timetable={timetable}
                subjects={subjects}
                faculty={faculty}
                userRole={role}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'notifications' && (
              <NotificationsView
                notifications={notifications}
                userRole={role}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                students={students}
                attendance={attendance}
                marks={marks}
                departments={departments}
                fees={fees}
                onOpenAI={() => setAiModalOpen(true)}
              />
            )}

            {currentTab === 'ai-center' && (
              <ReportsView
                students={students}
                attendance={attendance}
                marks={marks}
                departments={departments}
                fees={fees}
                onOpenAI={() => setAiModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* AI Assistant Chat Modal */}
      <AIChatModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        students={students}
        attendance={attendance}
        marks={marks}
        assignments={assignments}
        fees={fees}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
