import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CustomerProfile, FreelancerProfile, CustomerType, WorkerSkill, LanguageCode } from '../types';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';
import { ConfirmationResult } from 'firebase/auth';

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
  email?: string;
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
  loginWithGoogle: (role?: UserRole) => Promise<{ success: boolean; user?: User; error?: string }>;
  sendPhoneOtp: (phoneNumber: string, containerId?: string) => Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }>;
  verifyPhoneOtp: (confirmationResult: ConfirmationResult, code: string, role?: UserRole) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
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

  // Rehydrate persistent database user session and user directory on mount
  useEffect(() => {
    async function loadBackendSession() {
      try {
        const dbUsers = await apiClient.getUsers();
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
        }
        const me = await apiClient.getMe();
        if (me) {
          setCurrentUser(me);
        }
      } catch (err) {
        console.warn('Backend database session note:', err);
      }
    }
    loadBackendSession();
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        // Try fetching user document from Firestore
        const firestoreUser = await firebaseService.getUser(firebaseUser.uid);
        if (firestoreUser) {
          setCurrentUser(firestoreUser);
          setUsers(prev => {
            const exists = prev.some(u => u.id === firestoreUser.id);
            return exists ? prev.map(u => u.id === firestoreUser.id ? firestoreUser : u) : [firestoreUser, ...prev];
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (identifier: string, password?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanMobile = identifier.trim().replace(/\s+/g, '');

    // 1. Prioritize Backend SQLite Database Authentication
    try {
      const res = await apiClient.login(identifier, password);
      if (res && res.user) {
        setCurrentUser(res.user);
        setUsers(prev => {
          const exists = prev.some(u => u.id === res.user.id);
          return exists ? prev.map(u => u.id === res.user.id ? res.user : u) : [res.user, ...prev];
        });
        return { success: true, user: res.user };
      }
    } catch (apiErr: any) {
      if (apiErr.message?.includes('Incorrect password')) {
        return { success: false, error: apiErr.message };
      }
      console.warn('Backend login note, falling back:', apiErr.message);
    }

    // 2. If identifier is an email and password is provided, try Firebase Auth first
    if (cleanId.includes('@') && password) {
      try {
        const fbUser = await authService.loginWithEmail(cleanId, password);
        const firestoreUser = await firebaseService.getUser(fbUser.uid);
        if (firestoreUser) {
          setCurrentUser(firestoreUser);
          return { success: true, user: firestoreUser };
        }

        // Check local matching email
        const localFound = users.find(u => u.email?.toLowerCase() === cleanId);
        if (localFound) {
          const syncedUser = { ...localFound, id: fbUser.uid };
          setCurrentUser(syncedUser);
          firebaseService.syncUser(syncedUser);
          return { success: true, user: syncedUser };
        }

        // Create fallback customer user if no profile exists
        const newUser: User = {
          id: fbUser.uid,
          role: 'customer',
          name: fbUser.displayName || cleanId.split('@')[0],
          email: fbUser.email || cleanId,
          mobile: fbUser.phoneNumber || '',
          location: 'Goa',
          createdAt: new Date().toISOString(),
          customerProfile: {
            customerType: 'individual',
            cityArea: 'Goa'
          }
        };
        setCurrentUser(newUser);
        setUsers(prev => [newUser, ...prev]);
        firebaseService.syncUser(newUser);
        return { success: true, user: newUser };
      } catch (err: any) {
        const code = err?.code;
        if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
          return { success: false, error: 'Invalid password or credentials. Please try again.' };
        }
        if (code === 'auth/user-not-found') {
          return { success: false, error: 'No Firebase account found with this email. Please register.' };
        }
        console.warn('Firebase loginWithEmail note, checking demo users:', err);
      }
    }

    // 3. Fallback to demo personas or local accounts
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
      error: 'Account not found. Please register or check your credentials.'
    };
  };

  const loginWithGoogle = async (role: UserRole = 'customer') => {
    try {
      const fbUser = await authService.loginWithGoogle();
      const firestoreUser = await firebaseService.getUser(fbUser.uid);

      if (firestoreUser) {
        setCurrentUser(firestoreUser);
        setUsers(prev => prev.some(u => u.id === firestoreUser.id) ? prev : [firestoreUser, ...prev]);
        return { success: true, user: firestoreUser };
      }

      // Check local users by email
      const localFound = users.find(u => u.email && u.email.toLowerCase() === fbUser.email?.toLowerCase());
      if (localFound) {
        const syncedUser = { ...localFound, id: fbUser.uid };
        setCurrentUser(syncedUser);
        firebaseService.syncUser(syncedUser);
        return { success: true, user: syncedUser };
      }

      // Create new user profile for Google sign-in
      const newUser: User = {
        id: fbUser.uid,
        role: role,
        name: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        mobile: fbUser.phoneNumber || '',
        location: 'Goa',
        createdAt: new Date().toISOString(),
        ...(role === 'customer' ? {
          customerProfile: {
            customerType: 'individual',
            cityArea: 'Goa'
          }
        } : {
          freelancerProfile: {
            freelancerId: `SQ-F-${Math.floor(1000 + Math.random() * 9000)}`,
            primarySkill: 'Plumber',
            additionalSkills: [],
            experienceYears: 1,
            location: 'Goa',
            preferredLanguage: 'en',
            availability: 'available',
            rating: 5.0,
            jobsCompleted: 0,
            dailyRate: 800,
            bio: 'Skilled worker verified with Google Sign-In',
            serviceAreas: ['Goa'],
            certifications: [],
            verified: true,
            avatarBg: 'from-blue-600 to-indigo-700'
          }
        })
      };

      setCurrentUser(newUser);
      setUsers(prev => [newUser, ...prev]);
      firebaseService.syncUser(newUser);
      return { success: true, user: newUser };
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      const code = err?.code;
      if (code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in popup was closed before completing.' };
      }
      if (code === 'auth/unauthorized-domain') {
        return { success: false, error: 'This domain is not authorized in Firebase Auth settings. Please add localhost to Authorized Domains.' };
      }
      return { success: false, error: err?.message || 'Google Sign-In failed. Please try again.' };
    }
  };

  const sendPhoneOtp = async (phoneNumber: string, containerId: string = 'recaptcha-container') => {
    try {
      const confirmationResult = await authService.sendPhoneOtp(phoneNumber, containerId);
      return { success: true, confirmationResult };
    } catch (err: any) {
      console.error('Send Phone OTP error:', err);
      return { success: false, error: err?.message || 'Failed to send SMS OTP. Please check the number.' };
    }
  };

  const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, code: string, role: UserRole = 'customer') => {
    try {
      const fbUser = await authService.verifyPhoneOtp(confirmationResult, code);
      const firestoreUser = await firebaseService.getUser(fbUser.uid);

      if (firestoreUser) {
        setCurrentUser(firestoreUser);
        return { success: true, user: firestoreUser };
      }

      // Check local user by phone
      const cleanPhone = (fbUser.phoneNumber || '').replace(/\D/g, '').slice(-10);
      const localFound = users.find(u => u.mobile.replace(/\D/g, '').slice(-10) === cleanPhone);
      if (localFound) {
        const syncedUser = { ...localFound, id: fbUser.uid };
        setCurrentUser(syncedUser);
        firebaseService.syncUser(syncedUser);
        return { success: true, user: syncedUser };
      }

      // Create new user profile for Phone auth
      const newUser: User = {
        id: fbUser.uid,
        role: role,
        name: `User ${cleanPhone.slice(-4) || 'Shramik'}`,
        mobile: fbUser.phoneNumber || '',
        location: 'Goa',
        createdAt: new Date().toISOString(),
        ...(role === 'customer' ? {
          customerProfile: {
            customerType: 'individual',
            cityArea: 'Goa'
          }
        } : {
          freelancerProfile: {
            freelancerId: `SQ-F-${Math.floor(1000 + Math.random() * 9000)}`,
            primarySkill: 'Plumber',
            additionalSkills: [],
            experienceYears: 1,
            location: 'Goa',
            preferredLanguage: 'hi',
            availability: 'available',
            rating: 5.0,
            jobsCompleted: 0,
            dailyRate: 800,
            bio: 'Verified worker registered with mobile OTP',
            serviceAreas: ['Goa'],
            certifications: [],
            verified: true,
            avatarBg: 'from-amber-600 to-orange-700'
          }
        })
      };

      setCurrentUser(newUser);
      setUsers(prev => [newUser, ...prev]);
      firebaseService.syncUser(newUser);
      return { success: true, user: newUser };
    } catch (err: any) {
      console.error('Verify Phone OTP error:', err);
      return { success: false, error: err?.message || 'Invalid SMS verification code. Please check and retry.' };
    }
  };

  const logout = async () => {
    try {
      apiClient.logout();
      await authService.logout();
    } catch (err) {
      console.warn('Logout notice:', err);
    }
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

    // 1. Register with SQLite backend database
    try {
      const res = await apiClient.registerCustomer({
        name: data.name.trim(),
        email: data.email?.trim() || `${cleanMobile}@customer.internal`,
        phone: data.mobile.trim(),
        password: data.password || 'password123',
        organization: data.businessName?.trim() || data.customerType
      });
      if (res && res.user) {
        setCurrentUser(res.user);
        setUsers(prev => [res.user, ...prev]);
        return { success: true, user: res.user };
      }
    } catch (err: any) {
      console.warn('Backend registerCustomer note:', err);
    }

    let firebaseUid: string | null = null;
    if (data.email && data.email.trim() && data.password && data.password.length >= 6) {
      try {
        const fbUser = await authService.registerWithEmail(data.email, data.password);
        firebaseUid = fbUser.uid;
      } catch (err: any) {
        if (err?.code === 'auth/email-already-in-use') {
          return { success: false, error: 'Email already registered with Firebase. Please login.' };
        }
      }
    }

    const newId = firebaseUid || `SQ-C-${Math.floor(100 + Math.random() * 900)}`;
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

    // 1. Register with SQLite backend database
    try {
      const res = await apiClient.registerFreelancer({
        name: data.name.trim(),
        email: data.email?.trim() || `${cleanMobile}@shramik.internal`,
        phone: data.mobile.trim(),
        password: data.password || 'password123',
        tradeCategory: data.primarySkill,
        location: data.location.trim(),
        dailyRate: 800,
        skills: [data.primarySkill, ...(data.additionalSkills || [])],
        languages: [data.preferredLanguage || 'mr']
      });
      if (res && res.user) {
        setCurrentUser(res.user);
        setUsers(prev => [res.user, ...prev]);
        return { success: true, user: res.user };
      }
    } catch (err: any) {
      console.warn('Backend registerFreelancer note:', err);
    }

    let firebaseUid: string | null = null;
    if (data.email && data.email.trim() && data.password && data.password.length >= 6) {
      try {
        const fbUser = await authService.registerWithEmail(data.email, data.password);
        firebaseUid = fbUser.uid;
      } catch (err: any) {
        if (err?.code === 'auth/email-already-in-use') {
          return { success: false, error: 'Email already registered with Firebase. Please login.' };
        }
      }
    }

    const freelancerId = `SQ-F-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = firebaseUid || freelancerId;
    const newUser: User = {
      id: newId,
      role: 'freelancer',
      name: data.name.trim(),
      mobile: data.mobile.trim(),
      email: data.email?.trim(),
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
    firebaseService.syncUser(updatedUser);
  };

  const updateFreelancerProfile = async (profile: Partial<FreelancerProfile>, name?: string, location?: string) => {
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
    firebaseService.syncUser(updatedUser);

    try {
      await apiClient.updateFreelancerProfile(currentUser.id, {
        name,
        location,
        bio: profile.bio,
        availability: profile.availability,
        dailyRate: profile.dailyRate,
        experienceYears: profile.experienceYears,
        skills: profile.additionalSkills ? [profile.primarySkill, ...profile.additionalSkills].filter(Boolean) : undefined,
        languages: profile.preferredLanguage ? [profile.preferredLanguage] : undefined
      });
    } catch (err) {
      console.warn('Backend updateFreelancerProfile error:', err);
    }
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
        firebaseService.syncUser(updatedWorker);
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
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
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
