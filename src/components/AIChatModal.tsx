import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  Loader2,
  Flame,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Student, AttendanceRecord, MarkRecord, Assignment, FeeRecord } from '../types';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
  assignments: Assignment[];
  fees: FeeRecord[];
}

interface Message {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  students,
  attendance,
  marks,
  assignments,
  fees,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'gemini',
      text: `Hello ${user?.name || 'there'}! I am your AI Academic & Administrative Advisor powered by Gemini 3.8.
I have secure access to authorized institutional records (attendance, examination grades, pending assignments, fee statuses, and departmental statistics).
How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Compile authorized structured data context to feed Gemini strictly based on user role
  const buildAuthorizedContext = () => {
    const role = user?.role || 'student';

    if (role === 'student') {
      const studentId = user?.studentId || 'CSE2026001';
      const myStudent = students.find((s) => s.studentId === studentId);
      const myAtt = attendance.filter((a) => a.studentId === studentId);
      const totalClasses = myAtt.length;
      const presentClasses = myAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
      const attPercent = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : '100';

      const myMarks = marks.filter((m) => m.studentId === studentId);
      const myAssignments = assignments.filter((asg) => asg.department === myStudent?.department);
      const myFee = fees.find((f) => f.studentId === studentId);

      return JSON.stringify({
        role: 'student',
        studentProfile: {
          id: studentId,
          name: myStudent ? `${myStudent.firstName} ${myStudent.lastName}` : user?.name,
          department: myStudent?.department,
          semester: myStudent?.semester,
        },
        attendanceSummary: {
          totalClasses,
          attended: presentClasses,
          percentage: `${attPercent}%`,
          breakdownBySubject: myAtt.map((a) => ({ subject: a.subjectName, status: a.status, date: a.date })),
        },
        examinationMarks: myMarks.map((m) => ({
          subject: m.subjectName,
          exam: m.examName,
          score: `${m.marksObtained}/${m.maxMarks}`,
          percentage: `${m.percentage}%`,
          grade: m.grade,
          status: m.status,
        })),
        pendingAssignments: myAssignments.map((a) => ({
          title: a.title,
          subject: a.subjectName,
          deadline: a.deadline,
          maxMarks: a.maxMarks,
        })),
        feeStatus: myFee
          ? {
              total: myFee.totalFee,
              paid: myFee.paidAmount,
              pending: myFee.pendingAmount,
              status: myFee.paymentStatus,
            }
          : 'No fee dues on record',
      });
    }

    if (role === 'parent') {
      const studentId = user?.linkedStudentId || 'CSE2026001';
      const wardStudent = students.find((s) => s.studentId === studentId);
      const wardAtt = attendance.filter((a) => a.studentId === studentId);
      const total = wardAtt.length;
      const attended = wardAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
      const attPct = total > 0 ? ((attended / total) * 100).toFixed(1) : '100';
      const wardMarks = marks.filter((m) => m.studentId === studentId);
      const wardFee = fees.find((f) => f.studentId === studentId);

      return JSON.stringify({
        role: 'parent',
        wardDetails: {
          studentId,
          name: wardStudent ? `${wardStudent.firstName} ${wardStudent.lastName}` : 'Vijay Kumar',
          department: wardStudent?.department,
        },
        attendance: `${attPct}% (${attended} of ${total} attended)`,
        examGrades: wardMarks.map((m) => ({
          subject: m.subjectName,
          marks: `${m.marksObtained}/${m.maxMarks}`,
          grade: m.grade,
          status: m.status,
        })),
        feeDues: wardFee
          ? {
              total: wardFee.totalFee,
              paid: wardFee.paidAmount,
              pending: wardFee.pendingAmount,
              status: wardFee.paymentStatus,
            }
          : 'Fee cleared',
      });
    }

    if (role === 'faculty') {
      const deptStudents = students.filter((s) => s.department === user?.department || s.department === 'CSE');
      const lowAttendanceStudents = deptStudents.filter((stu) => {
        const stuAtt = attendance.filter((a) => a.studentId === stu.studentId);
        if (stuAtt.length === 0) return false;
        const pres = stuAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
        return (pres / stuAtt.length) * 100 < 75;
      });

      return JSON.stringify({
        role: 'faculty',
        department: user?.department || 'CSE',
        totalAssignedStudents: deptStudents.length,
        studentsWithAttendanceBelow75: lowAttendanceStudents.map((s) => ({
          id: s.studentId,
          name: `${s.firstName} ${s.lastName}`,
          attendance: `${((attendance.filter((a) => a.studentId === s.studentId && (a.status === 'Present' || a.status === 'Late')).length / Math.max(1, attendance.filter((a) => a.studentId === s.studentId).length)) * 100).toFixed(1)}%`,
        })),
        recentExams: marks.slice(0, 8).map((m) => ({
          student: m.studentName,
          subject: m.subjectName,
          exam: m.examName,
          marks: `${m.marksObtained}/${m.maxMarks}`,
          grade: m.grade,
          status: m.status,
        })),
      });
    }

    // Admin role: full campus overview
    const deptStats = ['CSE', 'ECE', 'AI & DS'].map((dept) => {
      const sInDept = students.filter((s) => s.department === dept);
      return {
        department: dept,
        totalStudents: sInDept.length,
      };
    });

    return JSON.stringify({
      role: 'administrator',
      totalRegisteredStudents: students.length,
      activeStudents: students.filter((s) => s.status === 'Active').length,
      departmentBreakdown: deptStats,
      totalFeeCollected: fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0),
      totalFeePending: fees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0),
      lowAttendanceCount: students.filter((stu) => {
        const stuAtt = attendance.filter((a) => a.studentId === stu.studentId);
        if (stuAtt.length === 0) return false;
        const pres = stuAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
        return (pres / stuAtt.length) * 100 < 75;
      }).length,
    });
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const contextData = buildAuthorizedContext();
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: user?.role || 'student',
          systemContext: contextData,
          userMessage: textToSend,
        }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: data.text || data.error || 'I could not process the query right now.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'gemini',
          text: `Error connecting to AI service: ${err.message || 'Network error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Role-specific suggested prompt questions
  const getPromptSuggestions = () => {
    switch (user?.role) {
      case 'faculty':
        return [
          'Which students have attendance below 75%?',
          'Summarize the performance of my class.',
          'Identify students whose marks are in danger of failing.',
          'Suggest remedial study plans for struggling students.',
        ];
      case 'admin':
        return [
          'Show attendance and enrollment statistics by department.',
          'Summarize campus fee collection and pending dues.',
          'How many active students require academic intervention?',
          'Draft an institutional performance executive summary.',
        ];
      case 'parent':
        return [
          "What is my ward's current attendance percentage?",
          'Show examination results and recent grades.',
          'Is there any pending tuition or fee due?',
          'How is my child performing compared to passing criteria?',
        ];
      case 'student':
      default:
        return [
          'What is my current attendance percentage?',
          'Which subjects have my lowest marks?',
          'What assignments are currently pending?',
          'Give me personalized study advice for Machine Learning.',
        ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[720px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Gemini Academic Assistant</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Live DB Grounded
                </span>
              </div>
              <p className="text-xs text-indigo-300">
                Acting as advisor for <span className="font-semibold text-white capitalize">{user?.role}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Suggested:</span>
          {getPromptSuggestions().map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg whitespace-nowrap text-slate-700 transition-all font-medium shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/10'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`mt-1.5 text-[10px] ${
                    msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Gemini is analyzing institutional data records...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Type your question (e.g. 'Show students with attendance below 75%')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-100/80 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm outline-hidden transition-all text-slate-800 placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl flex items-center gap-2 text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
