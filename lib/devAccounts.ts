// Example accounts for development — matches seed.ts data
// TODO: remove this file and replace with real auth before going to production

import type { User } from '@/types/user';
import { Role } from '@prisma/client';

export type DevAccount = User;

export const DEV_ACCOUNTS: DevAccount[] = [
  // Secretaries (admin view)
  {
    id: 'dev-sec-sjensen2',
    netId: 'sjensen2',
    fullName: 'Sarah Jensen',
    email: 'mjohans0@byu.edu',
    role: Role.SECRETARY,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-sec-tbrown5',
    netId: 'tbrown5',
    fullName: 'Tyler Brown',
    email: 'mjohans0@byu.edu',
    role: Role.SECRETARY,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-sec-amiller3',
    netId: 'amiller3',
    fullName: 'Ashley Miller',
    email: 'mjohans0@byu.edu',
    role: Role.SECRETARY,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-sec-rmorgan1',
    netId: 'rmorgan1',
    fullName: 'Rachel Morgan',
    email: 'mjohans0@byu.edu',
    role: Role.SECRETARY,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },

  // Students (student view) - Only 3 for testing
  {
    id: 'dev-stu-mjohans0',
    netId: 'mjohans0',
    fullName: 'Michelle Johanson',
    email: 'mjohans0@byu.edu',
    role: Role.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-ksmith4',
    netId: 'ksmith4',
    fullName: 'Kyle Smith',
    email: 'mjohans0@byu.edu',
    role: Role.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'dev-stu-jwilson8',
    netId: 'jwilson8',
    fullName: 'Jacob Wilson',
    email: 'mjohans0@byu.edu',
    role: Role.STUDENT,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
];

export const DEV_SECRETARIES = DEV_ACCOUNTS.filter((a) => a.role === Role.SECRETARY);
export const DEV_STUDENTS = DEV_ACCOUNTS.filter((a) => a.role === Role.STUDENT);