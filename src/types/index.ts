export type UserRole = 'admin' | 'faculty' | 'student' | 'parent';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  linkedStudentId?: string; // For parents
  department?: string;
  studentId?: string;
  facultyId?: string;
  createdAt?: string;
}

export interface Student {
  id: string; // Firestore doc ID (or studentId)
  studentId: string; // e.g. CSE2026001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  department: string; // CSE, ECE, EEE, etc.
  course: string; // B.Tech CSE, M.Tech, etc.
  year: '1st Year' | '2nd Year' | '3rd Year' | 'Final Year';
  semester: number;
  section: string; // A, B, C
  admissionDate: string;
  academicYear: string; // 2025-2026
  guardianName: string;
  guardianPhone: string;
  profilePhoto?: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated';
}

export interface Faculty {
  id: string;
  facultyId: string; // e.g. FAC-CSE-101
  facultyName: string;
  email: string;
  phone: string;
  department: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'HOD' | 'Lecturer';
  subjects: string[]; // Subject IDs or codes
  qualification?: string;
  experienceYears?: number;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Retired';
  officeRoom?: string;
}

export interface Department {
  id: string;
  code: string; // CSE, ECE, EEE, MECH, CIVIL, AI & DS, IT
  name: string;
  hodName: string;
  contactEmail: string;
  contactPhone: string;
  coursesCount: number;
  studentsCount: number;
  facultyCount: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  durationYears: number;
  totalSemesters: number;
}

export interface Subject {
  id: string;
  code: string; // CS801
  name: string; // Machine Learning
  department: string;
  course: string;
  semester: number;
  credits: number;
  facultyId?: string;
  facultyName?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  section: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  remarks?: string;
  recordedBy: string; // faculty ID / name
}

export interface Examination {
  id: string;
  examId: string;
  examName: string; // Internal 1, Mid Term, Semester Finals, Model Exam, Practical
  examType: 'Internal' | 'Mid' | 'Semester' | 'Model' | 'Quiz' | 'Practical';
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  section: string;
  date: string;
  maxMarks: number;
  passingMarks: number;
}

export interface MarkRecord {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  subjectCode: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  assignmentMarks?: number;
  internalMarks?: number;
  practicalMarks?: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'Fail';
  remarks?: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  section: string;
  deadline: string;
  maxMarks: number;
  resourcesUrl?: string;
  facultyId: string;
  facultyName: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  fileLink?: string;
  marksAwarded?: number;
  feedback?: string;
  status: 'Pending' | 'Submitted' | 'Evaluated' | 'Late';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  semester: number;
  academicYear: string;
  tuitionFee: number;
  examFee: number;
  hostelFee: number;
  transportFee: number;
  libraryFee: number;
  otherFees: number;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  lastPaymentDate?: string;
  notes?: string;
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "10:00"
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  room: string;
  department: string;
  semester: number;
  section: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'General Announcement' | 'Exam Notification' | 'Assignment Notification' | 'Attendance Warning' | 'Fee Reminder' | 'Holiday Announcement' | 'Event Notification';
  targetRole: 'all' | 'students' | 'faculty' | 'parents';
  targetDepartment?: string;
  author: string;
  date: string;
  isImportant?: boolean;
}

export interface AIReport {
  id?: string;
  department: string;
  course: string;
  semester: string;
  dateRange: string;
  generatedAt: string;
  title: string;
  overview: string;
  attendanceSummary: string;
  academicSummary: string;
  assignmentSummary: string;
  feeSummary: string;
  importantObservations: string[];
  suggestedFollowUpActions: string[];
}
