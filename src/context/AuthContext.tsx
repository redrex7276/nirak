import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CustomerProfile, FreelancerProfile, CustomerType, WorkerSkill, LanguageCode } from '../types';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';

interface RegisterCustomerData {
  name: string;
  mobile: string;
  email?: string;
  location: string;
  customerType: CustomerType;
  businessName?: string;
  password?: string;
}

interface RegisterFreelancerData {
  name: string;
  mobile: string;
  primarySkill: WorkerSkill;
  additionalSkills: string[];
  experienceYears: number;
  location: string;
  preferredLanguage: LanguageCode;
  availability: 'available' | 'busy' | 'on_leave';
  password?: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (identifier: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  registerCustomer: (data: RegisterCustomerData) => Promise<{ success: boolean; user?: User; error?: string }>;
  registerFreelancer: (data: RegisterFreelancerData) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateCustomerProfile: (profile: Partial<CustomerProfile>, name?: string, location?: string) => void;
  updateFreelancerProfile: (profile: Partial<FreelancerProfile>, name?: string, location?: string) => void;
  updateAnyWorkerProfile: (workerId: string, profile: Partial<FreelancerProfile>) => void;
  switchDemoUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getCurrentUser());

  useEffect(() => {
    storageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    storageService.setCurrentUser(currentUser);
  }, [currentUser]);

  const login = async (identifier: string, _password?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanMobile = identifier.trim().replace(/\s+/g, '');

    const found = users.find(u => 
      u.id.toLowerCase() === cleanId ||
      u.mobile.replace(/\s+/g, '') === cleanMobile ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.freelancerProfile && u.freelancerProfile.freelancerId.toLowerCase() === cleanId)
    );

    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }

    return { 
      success: false, 
      error: 'Account not found. Please register or check your mobile / email.' 
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerCustomer = async (data: RegisterCustomerData) => {
    if (!data.name || data.name.trim().length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters.' };
    }

    const cleanMobile = data.mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }

    const existingMobile = users.find(u => u.mobile.replace(/\s+/g, '') === data.mobile.replace(/\s+/g, ''));
    if (existingMobile) {
      return { success: false, error: 'Mobile number already registered. Please login.' };
    }

    if (data.email && data.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email.trim())) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      const existingEmail = users.find(u => u.email && u.email.toLowerCase() === data.email!.trim().toLowerCase());
      if (existingEmail) {
        return { success: false, error: 'Email address already registered. Please login.' };
      }
    }

    if (data.password && data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const newId = `SQ-C-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: User = {
      id: newId,
      role: 'customer',
      name: data.name.trim(),
      mobile: data.mobile.trim(),
      email: data.email?.trim(),
      location: data.location.trim(),
      createdAt: new Date().toISOString(),
      customerProfile: {
        customerType: data.customerType,
        businessName: data.businessName?.trim(),
        cityArea: data.location.trim()
      }
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    setCurrentUser(newUser);
    firebaseService.syncUser(newUser);
    return { success: true, user: newUser };
  };

  const registerFreelancer = async (data: RegisterFreelancerData) => {
    if (!data.name || data.name.trim().length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters.' };
    }

    const cleanMobile = data.mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }

    const existing = users.find(u => u.mobile.replace(/\s+/g, '') === data.mobile.replace(/\s+/g, ''));
    if (existing) {
      return { success: false, error: 'Mobile number already registered. Please login.' };
    }

    if (data.password && data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const freelancerId = `SQ-F-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser: User = {
      id: freelancerId,
      role: 'freelancer',
      name: data.name.trim(),
      mobile: data.mobile.trim(),
      location: data.location.trim(),
      createdAt: new Date().toISOString(),
      freelancerProfile: {
        freelancerId: freelancerId,
        primarySkill: data.primarySkill,
        additionalSkills: data.additionalSkills,
        experienceYears: data.experienceYears,
        location: data.location.trim(),
        preferredLanguage: data.preferredLanguage,
        availability: data.availability,
        rating: 5.0,
        jobsCompleted: 0,
        dailyRate: 800,
        bio: `Skilled ${data.primarySkill} in ${data.location} with ${data.experienceYears} years experience.`,
        serviceAreas: [data.location.trim()],
        certifications: [],
        verified: true,
        avatarBg: 'from-blue-600 to-indigo-700'
      }
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    setCurrentUser(newUser);
    firebaseService.syncUser(newUser);
    return { success: true, user: newUser };
  };

  const updateCustomerProfile = (profile: Partial<CustomerProfile>, name?: string, location?: string) => {
    if (!currentUser || currentUser.role !== 'customer') return;

    const updatedUser: User = {
      ...currentUser,
      name: name || currentUser.name,
      location: location || currentUser.location,
      customerProfile: {
        ...currentUser.customerProfile!,
        ...profile
      }
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const updateFreelancerProfile = (profile: Partial<FreelancerProfile>, name?: string, location?: string) => {
    if (!currentUser || currentUser.role !== 'freelancer') return;

    const updatedUser: User = {
      ...currentUser,
      name: name || currentUser.name,
      location: location || currentUser.location,
      freelancerProfile: {
        ...currentUser.freelancerProfile!,
        ...profile
      }
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const updateAnyWorkerProfile = (workerId: string, profile: Partial<FreelancerProfile>) => {
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === workerId || u.freelancerProfile?.freelancerId === workerId) {
        const updatedWorker = {
          ...u,
          freelancerProfile: {
            ...u.freelancerProfile!,
            ...profile
          }
        };
        if (currentUser?.id === u.id || currentUser?.freelancerProfile?.freelancerId === workerId) {
          setCurrentUser(updatedWorker);
        }
        return updatedWorker;
      }
      return u;
    }));
  };

  const switchDemoUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        registerCustomer,
        registerFreelancer,
        updateCustomerProfile,
        updateFreelancerProfile,
        updateAnyWorkerProfile,
        switchDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
