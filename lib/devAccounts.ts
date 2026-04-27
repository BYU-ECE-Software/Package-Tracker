// Example accounts for development — matches seed.ts data
// TODO: remove this file and replace with real auth before going to production

import type { User } from '@/types/user';
import { UserRole } from '@prisma/client';

export type DevAccount = User;

export const DEV_ACCOUNTS: DevAccount[] = [
  // Secretaries (admin view)
  {
    id: 'dev-sec-sjensen2',
    netId: 'sjensen2',
    fullName: 'Sarah Jensen',
    email: 'sjensen2@byu.edu',
    role: UserRole.SECRETARY,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-sec-tbrown5',
    netId: 'tbrown5',
    fullName: 'Tyler Brown',
    email: 'tbrown5@byu.edu',
    role: UserRole.SECRETARY,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-sec-amiller3',
    netId: 'amiller3',
    fullName: 'Ashley Miller',
    email: 'amiller3@byu.edu',
    role: UserRole.SECRETARY,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-sec-rmorgan1',
    netId: 'rmorgan1',
    fullName: 'Rachel Morgan',
    email: 'rmorgan1@byu.edu',
    role: UserRole.SECRETARY,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },

  // Students (student view)
  {
    id: 'dev-stu-mjohans0',
    netId: 'mjohans0',
    fullName: 'Mark Johansen',
    email: 'mjohans0@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-ksmith4',
    netId: 'ksmith4',
    fullName: 'Kyle Smith',
    email: 'ksmith4@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-lnelson7',
    netId: 'lnelson7',
    fullName: 'Lily Nelson',
    email: 'lnelson7@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-dcarter2',
    netId: 'dcarter2',
    fullName: 'David Carter',
    email: 'dcarter2@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-ewhite9',
    netId: 'ewhite9',
    fullName: 'Emma White',
    email: 'ewhite9@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-blee6',
    netId: 'blee6',
    fullName: 'Brandon Lee',
    email: 'blee6@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-ngarcia3',
    netId: 'ngarcia3',
    fullName: 'Natalie Garcia',
    email: 'ngarcia3@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-jwilson8',
    netId: 'jwilson8',
    fullName: 'Jacob Wilson',
    email: 'jwilson8@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-ctaylor1',
    netId: 'ctaylor1',
    fullName: 'Claire Taylor',
    email: 'ctaylor1@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-panderson5',
    netId: 'panderson5',
    fullName: 'Parker Anderson',
    email: 'panders5@byu.edu',
    role: UserRole.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
];

export const DEV_SECRETARIES = DEV_ACCOUNTS.filter((a) => a.role === UserRole.SECRETARY);
export const DEV_STUDENTS = DEV_ACCOUNTS.filter((a) => a.role === UserRole.STUDENT);