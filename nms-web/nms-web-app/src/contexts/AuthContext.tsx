// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { UserRole } from '@/types/admin';

/**
 * Defines the shape of the authentication context's value.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isDoctor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Fetches the user's role from Firestore.
 * Checks both 'users' and 'doctors' collections.
 */
async function fetchUserRole(uid: string): Promise<UserRole | null> {
  try {
    // First check the users collection for admin or patient role
    const userDocRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      console.log("USER ROLE:", data.role )
      if (data.role === 'admin') {
        return 'admin';
      }
      if (data.role === 'patient') {
        return 'patient';
      }
      // If role is 'doctor' in users collection, verify in doctors collection
      if (data.role === 'doctor') {
        return 'doctor';
      }
    }
    
    // Check the doctors collection
    const doctorDocRef = doc(db, 'doctors', uid);
    const doctorSnapshot = await getDoc(doctorDocRef);
    
    if (doctorSnapshot.exists()) {
      return 'doctor';
    }
    
    // No role found - could be a new user
    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  useEffect(() => {
    // Listen for changes in the user's authentication state.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user role from Firestore
        const role = await fetchUserRole(firebaseUser.uid);
        setUserRole(role);
        console.log("USER ROLE:", role )
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts.
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    userRole,
    isAdmin: userRole === 'admin',
    isDoctor: userRole === 'doctor',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}