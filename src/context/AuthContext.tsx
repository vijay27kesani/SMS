import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { seedInitialDataIfEmpty } from '../services/dataService';

interface AuthContextType {
  user: UserProfile | null;
  loginAs: (role: UserRole, customUid?: string) => void;
  logout: () => void;
  isLoading: boolean;
  switchRole: (role: UserRole) => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  admin: {
    uid: 'admin-01',
    email: 'admin@apexuniversity.edu',
    name: 'Dr. Katherine Bell',
    role: 'admin',
    phone: '+1 (555) 019-2831',
    department: 'CSE',
  },
  faculty: {
    uid: 'fac-101',
    email: 'aris.thorne@apexuniversity.edu',
    name: 'Dr. Aris Thorne',
    role: 'faculty',
    phone: '+1 (555) 789-0123',
    department: 'CSE',
    facultyId: 'FAC-CSE-101',
  },
  student: {
    uid: 'stu-cse-001',
    email: 'student@example.com',
    name: 'Vijay Kumar',
    role: 'student',
    phone: '+1 (555) 987-6541',
    studentId: 'CSE2026001',
    department: 'CSE',
  },
  parent: {
    uid: 'parent-01',
    email: 'ramesh.kumar@example.com',
    name: 'Ramesh Kumar (Parent)',
    role: 'parent',
    phone: '+1 (555) 123-4567',
    linkedStudentId: 'CSE2026001',
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginAs: () => {},
  logout: () => {},
  isLoading: true,
  switchRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sms_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USERS.admin;
      }
    }
    return DEFAULT_USERS.admin; // Default login to Admin on start
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Seed Firestore database on initial load if needed
    seedInitialDataIfEmpty().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const loginAs = (role: UserRole, customUid?: string) => {
    const targetUser = { ...DEFAULT_USERS[role] };
    if (customUid) {
      targetUser.uid = customUid;
    }
    setUser(targetUser);
    localStorage.setItem('sms_current_user', JSON.stringify(targetUser));
  };

  const switchRole = (role: UserRole) => {
    loginAs(role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sms_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout, isLoading, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
