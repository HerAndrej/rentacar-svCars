'use client';

import { createContext, useContext } from 'react';
import type { UserRole } from '@/lib/auth-utils';

interface AuthContextType {
  role: UserRole;
  userId: string;
  displayName: string;
}

const AuthContext = createContext<AuthContextType>({
  role: 'admin',
  userId: '',
  displayName: '',
});

export function AuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AuthContextType;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
