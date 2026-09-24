import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Award,
  FileText,
  CreditCard,
  Calendar,
  Bell,
  Sparkles,
  BarChart3,
  LogOut,
  ChevronRight,
  Shield,
  Layers,
  School,
  Settings
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
}) => {
  const { user, switchRole, logout } = useAuth();
  const role = user?.role || 'admin';

  // Navigation configurations based on role
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Student Directory', icon: Users },
          { id: 'faculty', label: 'Faculty Directory', icon: UserCheck },
          { id: 'academics', label: 'Departments & Courses', icon: School },
          { id: 'attendance', label: 'Attendance Management', icon: CalendarCheck },
          { id: 'exams', label: 'Exams & Marks', icon: Award },
          { id: 'assignments', label: 'Assignments Hub', icon: FileText },
          { id: 'fees', label: 'Fee Management', icon: CreditCard },
          { id: 'timetable', label: 'Timetable Schedules', icon: Calendar },
          { id: 'notifications', label: 'Announcements & Alerts', icon: Bell },
          { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
          { id: 'ai-center', label: 'AI Dean & Analytics', icon: Sparkles, badge: 'Gemini' },
        ];

      case 'faculty':
        return [
          { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
          { id: 'students', label: 'My Students', icon: Users },
          { id: 'exams', label: 'Manage Exams & Marks', icon: Award },
          { id: 'assignments', label: 'Assignments & Review', icon: FileText },
          { id: 'timetable', label: 'Class Timetable', icon: Calendar },
          { id: 'notifications', label: 'Post Announcements', icon: Bell },
          { id: 'reports', label: 'Performance Reports', icon: BarChart3 },
          { id: 'ai-center', label: 'AI Class Assistant', icon: Sparkles, badge: 'Gemini' },
        ];

      case 'student':
        return [
          { id: 'dashboard', label: 'My Student Portal', icon: LayoutDashboard },
          { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
          { id: 'exams', label: 'Exam Results & Marks', icon: Award },
          { id: 'assignments', label: 'Assignments & Tasks', icon: FileText },
          { id: 'fees', label: 'Fee Dues & Receipts', icon: CreditCard },
          { id: 'timetable', label: 'Class Schedule', icon: Calendar },
          { id: 'notifications', label: 'Campus Notices', icon: Bell },
          { id: 'ai-center', label: 'AI Study Mentor', icon: Sparkles, badge: 'Gemini' },
        ];

      case 'parent':
        return [
          { id: 'dashboard', label: 'Parent Overview', icon: LayoutDashboard },
          { id: 'attendance', label: 'Ward Attendance', icon: CalendarCheck },
          { id: 'exams', label: 'Academic Performance', icon: Award },
          { id: 'fees', label: 'Fee Status & Dues', icon: CreditCard },
          { id: 'notifications', label: 'College Notices', icon: Bell },
          { id: 'ai-center', label: 'AI Progress Advisor', icon: Sparkles, badge: 'Gemini' },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-tight">
                Apex University
              </h1>
              <p className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                <span>AI Student Management</span>
              </p>
            </div>
          </div>
        </div>

        {/* Role switcher capsule */}
        <div className="p-3 mx-4 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Active Role
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium capitalize">
              {role}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {(['admin', 'faculty', 'student', 'parent'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`py-1.5 text-[11px] font-medium rounded-lg transition-all capitalize text-center ${
                  role === r
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {r === 'parent' ? 'Par' : r === 'faculty' ? 'Fac' : r === 'student' ? 'Stu' : 'Adm'}
              </button>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-300 border border-amber-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs border border-indigo-400/30">
              {user?.name?.slice(0, 2).toUpperCase() || 'AP'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
