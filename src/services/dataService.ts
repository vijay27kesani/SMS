import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Student, Faculty, Department, Course, Subject,
  AttendanceRecord, Examination, MarkRecord, Assignment,
  Submission, FeeRecord, TimetableEntry, NotificationItem,
  AIReport, UserProfile
} from '../types';
import {
  INITIAL_DEPARTMENTS, INITIAL_COURSES, INITIAL_SUBJECTS,
  INITIAL_FACULTY, INITIAL_STUDENTS, INITIAL_ATTENDANCE,
  INITIAL_EXAMS, INITIAL_MARKS, INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS, INITIAL_FEES, INITIAL_TIMETABLE,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

// Function to seed Firestore if empty
export async function seedInitialDataIfEmpty(): Promise<boolean> {
  try {
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (!studentsSnap.empty) {
      console.log('Firestore already contains data. Skipping initial seed.');
      return false;
    }

    console.log('Seeding initial university data into Firestore...');

    // Seed departments
    for (const d of INITIAL_DEPARTMENTS) {
      await setDoc(doc(db, 'departments', d.id), d);
    }
    // Seed courses
    for (const c of INITIAL_COURSES) {
      await setDoc(doc(db, 'courses', c.id), c);
    }
    // Seed subjects
    for (const s of INITIAL_SUBJECTS) {
      await setDoc(doc(db, 'subjects', s.id), s);
    }
    // Seed faculty
    for (const f of INITIAL_FACULTY) {
      await setDoc(doc(db, 'faculty', f.id), f);
    }
    // Seed students
    for (const s of INITIAL_STUDENTS) {
      await setDoc(doc(db, 'students', s.id), s);
    }
    // Seed attendance
    for (const a of INITIAL_ATTENDANCE) {
      await setDoc(doc(db, 'attendance', a.id), a);
    }
    // Seed exams
    for (const e of INITIAL_EXAMS) {
      await setDoc(doc(db, 'exams', e.id), e);
    }
    // Seed marks
    for (const m of INITIAL_MARKS) {
      await setDoc(doc(db, 'marks', m.id), m);
    }
    // Seed assignments
    for (const asg of INITIAL_ASSIGNMENTS) {
      await setDoc(doc(db, 'assignments', asg.id), asg);
    }
    // Seed submissions
    for (const sub of INITIAL_SUBMISSIONS) {
      await setDoc(doc(db, 'submissions', sub.id), sub);
    }
    // Seed fees
    for (const fee of INITIAL_FEES) {
      await setDoc(doc(db, 'fees', fee.id), fee);
    }
    // Seed timetable
    for (const tt of INITIAL_TIMETABLE) {
      await setDoc(doc(db, 'timetable', tt.id), tt);
    }
    // Seed notifications
    for (const n of INITIAL_NOTIFICATIONS) {
      await setDoc(doc(db, 'notifications', n.id), n);
    }

    console.log('Initial university data successfully seeded into Firestore.');
    return true;
  } catch (err) {
    console.error('Error seeding initial Firestore data:', err);
    return false;
  }
}

// Student CRUD
export async function getStudents(): Promise<Student[]> {
  const snap = await getDocs(collection(db, 'students'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Student));
}

export async function addStudent(student: Omit<Student, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'students'), student);
  return docRef.id;
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<void> {
  await updateDoc(doc(db, 'students', id), updates);
}

export async function deleteStudent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'students', id));
}

// Faculty CRUD
export async function getFaculty(): Promise<Faculty[]> {
  const snap = await getDocs(collection(db, 'faculty'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Faculty));
}

export async function addFaculty(faculty: Omit<Faculty, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'faculty'), faculty);
  return docRef.id;
}

export async function updateFaculty(id: string, updates: Partial<Faculty>): Promise<void> {
  await updateDoc(doc(db, 'faculty', id), updates);
}

export async function deleteFaculty(id: string): Promise<void> {
  await deleteDoc(doc(db, 'faculty', id));
}

// Departments, Courses, Subjects
export async function getDepartments(): Promise<Department[]> {
  const snap = await getDocs(collection(db, 'departments'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Department));
}

export async function addDepartment(dept: Omit<Department, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'departments'), dept);
  return docRef.id;
}

export async function getCourses(): Promise<Course[]> {
  const snap = await getDocs(collection(db, 'courses'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Course));
}

export async function addCourse(course: Omit<Course, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'courses'), course);
  return docRef.id;
}

export async function getSubjects(): Promise<Subject[]> {
  const snap = await getDocs(collection(db, 'subjects'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Subject));
}

export async function addSubject(subject: Omit<Subject, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'subjects'), subject);
  return docRef.id;
}

// Attendance
export async function getAttendance(): Promise<AttendanceRecord[]> {
  const snap = await getDocs(collection(db, 'attendance'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as AttendanceRecord));
}

export async function markAttendance(record: Omit<AttendanceRecord, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'attendance'), record);
  return docRef.id;
}

export async function batchMarkAttendance(records: Omit<AttendanceRecord, 'id'>[]): Promise<void> {
  for (const r of records) {
    await addDoc(collection(db, 'attendance'), r);
  }
}

export async function updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<void> {
  await updateDoc(doc(db, 'attendance', id), updates);
}

// Exams & Marks
export async function getExams(): Promise<Examination[]> {
  const snap = await getDocs(collection(db, 'exams'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Examination));
}

export async function addExam(exam: Omit<Examination, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'exams'), exam);
  return docRef.id;
}

export async function getMarks(): Promise<MarkRecord[]> {
  const snap = await getDocs(collection(db, 'marks'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as MarkRecord));
}

export async function addMark(mark: Omit<MarkRecord, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'marks'), mark);
  return docRef.id;
}

export async function updateMark(id: string, updates: Partial<MarkRecord>): Promise<void> {
  await updateDoc(doc(db, 'marks', id), updates);
}

// Assignments & Submissions
export async function getAssignments(): Promise<Assignment[]> {
  const snap = await getDocs(collection(db, 'assignments'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Assignment));
}

export async function addAssignment(assignment: Omit<Assignment, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'assignments'), assignment);
  return docRef.id;
}

export async function getSubmissions(): Promise<Submission[]> {
  const snap = await getDocs(collection(db, 'submissions'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Submission));
}

export async function addSubmission(submission: Omit<Submission, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'submissions'), submission);
  return docRef.id;
}

export async function updateSubmission(id: string, updates: Partial<Submission>): Promise<void> {
  await updateDoc(doc(db, 'submissions', id), updates);
}

// Fees
export async function getFees(): Promise<FeeRecord[]> {
  const snap = await getDocs(collection(db, 'fees'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as FeeRecord));
}

export async function updateFee(id: string, updates: Partial<FeeRecord>): Promise<void> {
  await updateDoc(doc(db, 'fees', id), updates);
}

export async function addFee(fee: Omit<FeeRecord, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'fees'), fee);
  return docRef.id;
}

// Timetable
export async function getTimetable(): Promise<TimetableEntry[]> {
  const snap = await getDocs(collection(db, 'timetable'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as TimetableEntry));
}

export async function addTimetableEntry(entry: Omit<TimetableEntry, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'timetable'), entry);
  return docRef.id;
}

// Notifications
export async function getNotifications(): Promise<NotificationItem[]> {
  const snap = await getDocs(collection(db, 'notifications'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as NotificationItem));
}

export async function addNotification(notif: Omit<NotificationItem, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'notifications'), notif);
  return docRef.id;
}
