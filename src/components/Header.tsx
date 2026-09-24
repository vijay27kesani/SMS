import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Sparkles,
  Calendar,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenAIChat: () => void;
  notifications: NotificationItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenAIChat,
  notifications,
  searchTerm,
  setSearchTerm,
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const importantNotifs = notifications.filter(n => n.isImportant);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-3 md:gap-6 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-slate-600 rounded-lg lg:hidden hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, faculty, subjects, or courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 border border-transparent focus:border-indigo-400 focus:bg-white rounded-xl outline-hidden transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* Right: Quick actions, AI Launch button, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Gemini AI Floating Assistant Trigger */}
        <button
          onClick={onOpenAIChat}
          className="flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 text-xs md:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">Ask Gemini AI</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Campus Alerts</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                    {notifications.length}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Live feed</span>
              </div>

              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      notif.isImportant
                        ? 'bg-amber-50/60 border-amber-200/80 text-amber-900'
                        : 'bg-slate-50 border-slate-200/70 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold">{notif.title}</span>
                      {notif.isImportant && (
                        <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{notif.author}</span>
                      <span>{notif.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User indicator */}
        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center border border-indigo-200">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-indigo-600 font-semibold capitalize tracking-wide">
              {user?.role} Portal
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
