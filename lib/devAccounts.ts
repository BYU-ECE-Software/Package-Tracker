// Example accounts for development — matches seed.ts data
// TODO: remove this file and replace with real auth before going to production

import { UserRole } from '@prisma/client';

export type DevAccount = {
  netId: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export const DEV_ACCOUNTS: DevAccount[] = [
  // Secretaries (admin view)
  { netId: 'sjensen2', fullName: 'Sarah Jensen',  email: 'sjensen2@byu.edu', role: UserRole.SECRETARY },
  { netId: 'tbrown5',  fullName: 'Tyler Brown',   email: 'tbrown5@byu.edu',  role: UserRole.SECRETARY },
  { netId: 'amiller3', fullName: 'Ashley Miller', email: 'amiller3@byu.edu', role: UserRole.SECRETARY },
  { netId: 'rmorgan1', fullName: 'Rachel Morgan', email: 'rmorgan1@byu.edu', role: UserRole.SECRETARY },

  // Students (student view)
  { netId: 'mjohans0',  fullName: 'Mark Johansen',   email: 'mjohans0@byu.edu',  role: UserRole.STUDENT },
  { netId: 'ksmith4',   fullName: 'Kyle Smith',      email: 'ksmith4@byu.edu',   role: UserRole.STUDENT },
  { netId: 'lnelson7',  fullName: 'Lily Nelson',     email: 'lnelson7@byu.edu',  role: UserRole.STUDENT },
  { netId: 'dcarter2',  fullName: 'David Carter',    email: 'dcarter2@byu.edu',  role: UserRole.STUDENT },
  { netId: 'ewhite9',   fullName: 'Emma White',      email: 'ewhite9@byu.edu',   role: UserRole.STUDENT },
  { netId: 'blee6',     fullName: 'Brandon Lee',     email: 'blee6@byu.edu',     role: UserRole.STUDENT },
  { netId: 'ngarcia3',  fullName: 'Natalie Garcia',  email: 'ngarcia3@byu.edu',  role: UserRole.STUDENT },
  { netId: 'jwilson8',  fullName: 'Jacob Wilson',    email: 'jwilson8@byu.edu',  role: UserRole.STUDENT },
  { netId: 'ctaylor1',  fullName: 'Claire Taylor',   email: 'ctaylor1@byu.edu',  role: UserRole.STUDENT },
  { netId: 'panderson5',fullName: 'Parker Anderson', email: 'panders5@byu.edu',  role: UserRole.STUDENT },
];

export const DEV_SECRETARIES = DEV_ACCOUNTS.filter((a) => a.role === UserRole.SECRETARY);
export const DEV_STUDENTS    = DEV_ACCOUNTS.filter((a) => a.role === UserRole.STUDENT);