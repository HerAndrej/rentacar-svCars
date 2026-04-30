import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'radnik';

export function getUserRole(user: User): UserRole {
  const role = user.user_metadata?.role;
  return role === 'radnik' ? 'radnik' : 'admin';
}

export function isAdmin(user: User): boolean {
  return getUserRole(user) !== 'radnik';
}

export function isWorker(user: User): boolean {
  return getUserRole(user) === 'radnik';
}
