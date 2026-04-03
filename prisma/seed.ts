import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Secretaries ──────────────────────────────────────────────────────────
  const secretaryData = [
    { netId: 'sjensen2',  fullName: 'Sarah Jensen',   email: 'sjensen2@byu.edu'  },
    { netId: 'tbrown5',   fullName: 'Tyler Brown',    email: 'tbrown5@byu.edu'   },
    { netId: 'amiller3',  fullName: 'Ashley Miller',  email: 'amiller3@byu.edu'  },
    { netId: 'rmorgan1',  fullName: 'Rachel Morgan',  email: 'rmorgan1@byu.edu'  },
  ];

  const secretaries = await Promise.all(
    secretaryData.map((s) =>
      prisma.user.upsert({
        where: { netId: s.netId },
        update: {},
        create: { ...s, role: UserRole.SECRETARY },
      })
    )
  );
  console.log(`  ${secretaries.length} secretaries seeded`);

  // ── Students ─────────────────────────────────────────────────────────────
  const studentData = [
    { netId: 'mjohans0',  fullName: 'Mark Johansen',   email: 'mjohans0@byu.edu'  },
    { netId: 'ksmith4',   fullName: 'Kyle Smith',      email: 'ksmith4@byu.edu'   },
    { netId: 'lnelson7',  fullName: 'Lily Nelson',     email: 'lnelson7@byu.edu'  },
    { netId: 'dcarter2',  fullName: 'David Carter',    email: 'dcarter2@byu.edu'  },
    { netId: 'ewhite9',   fullName: 'Emma White',      email: 'ewhite9@byu.edu'   },
    { netId: 'blee6',     fullName: 'Brandon Lee',     email: 'blee6@byu.edu'     },
    { netId: 'ngarcia3',  fullName: 'Natalie Garcia',  email: 'ngarcia3@byu.edu'  },
    { netId: 'jwilson8',  fullName: 'Jacob Wilson',    email: 'jwilson8@byu.edu'  },
    { netId: 'ctaylor1',  fullName: 'Claire Taylor',   email: 'ctaylor1@byu.edu'  },
    { netId: 'panderson5',fullName: 'Parker Anderson', email: 'panders5@byu.edu'  },
  ];

  const students = await Promise.all(
    studentData.map((s) =>
      prisma.user.upsert({
        where: { netId: s.netId },
        update: {},
        create: { ...s, role: UserRole.STUDENT },
      })
    )
  );
  console.log(`  ${students.length} students seeded`);

  // ── Carriers ─────────────────────────────────────────────────────────────
  const carrierNames = ['Amazon', 'FedEx', 'UPS', 'USPS', 'DHL'];

  const carriers = await Promise.all(
    carrierNames.map((name, i) =>
      prisma.carrier.upsert({
        where: { name },
        update: {},
        create: { name, isActive: true, order: i },
      })
    )
  );
  console.log(`  ${carriers.length} carriers seeded`);

  // ── Senders ───────────────────────────────────────────────────────────────
  const senderNames = ['ThorLabs', 'McMaster Carr', 'Mouser', 'DigiKey', 'Amazon'];

  const senders = await Promise.all(
    senderNames.map((name, i) =>
      prisma.sender.upsert({
        where: { name },
        update: {},
        create: { name, isActive: true, order: i },
      })
    )
  );
  console.log(`  ${senders.length} senders seeded`);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const daysAgo = (n: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  // ── Packages ──────────────────────────────────────────────────────────────
  // Clear existing packages so the seed is idempotent
  await prisma.package.deleteMany();

  const packageDefs: {
    studentIdx: number;
    carrierIdx: number;
    senderIdx: number;
    arrivedDaysAgo: number;
    pickedUpDaysAgo?: number;
    deliveredToOffice: boolean;
    checkedInByIdx: number;
    checkedOutByIdx?: number;
    notes?: string;
  }[] = [
    // Arrived, not yet picked up
    { studentIdx: 0, carrierIdx: 0, senderIdx: 3, arrivedDaysAgo: 1,  deliveredToOffice: false, checkedInByIdx: 0 },
    { studentIdx: 1, carrierIdx: 1, senderIdx: 0, arrivedDaysAgo: 2,  deliveredToOffice: false, checkedInByIdx: 1, notes: 'Fragile — handle with care' },
    { studentIdx: 2, carrierIdx: 3, senderIdx: 2, arrivedDaysAgo: 3,  deliveredToOffice: false, checkedInByIdx: 2 },
    { studentIdx: 4, carrierIdx: 2, senderIdx: 1, arrivedDaysAgo: 1,  deliveredToOffice: false, checkedInByIdx: 0 },
    { studentIdx: 7, carrierIdx: 4, senderIdx: 4, arrivedDaysAgo: 4,  deliveredToOffice: false, checkedInByIdx: 3, notes: 'Two boxes — kept together' },

    // Picked up by student
    { studentIdx: 3, carrierIdx: 1, senderIdx: 3, arrivedDaysAgo: 7,  pickedUpDaysAgo: 5,  deliveredToOffice: false, checkedInByIdx: 1, checkedOutByIdx: 1 },
    { studentIdx: 5, carrierIdx: 0, senderIdx: 2, arrivedDaysAgo: 10, pickedUpDaysAgo: 8,  deliveredToOffice: false, checkedInByIdx: 2, checkedOutByIdx: 0 },
    { studentIdx: 6, carrierIdx: 3, senderIdx: 0, arrivedDaysAgo: 5,  pickedUpDaysAgo: 3,  deliveredToOffice: false, checkedInByIdx: 3, checkedOutByIdx: 2 },
    { studentIdx: 8, carrierIdx: 2, senderIdx: 4, arrivedDaysAgo: 14, pickedUpDaysAgo: 12, deliveredToOffice: false, checkedInByIdx: 0, checkedOutByIdx: 1 },

    // Delivered to office
    { studentIdx: 9, carrierIdx: 1, senderIdx: 1, arrivedDaysAgo: 6,  pickedUpDaysAgo: 4,  deliveredToOffice: true,  checkedInByIdx: 1, checkedOutByIdx: 3, notes: 'Delivered to lab directly' },
    { studentIdx: 0, carrierIdx: 4, senderIdx: 3, arrivedDaysAgo: 8,  pickedUpDaysAgo: 5,  deliveredToOffice: true,  checkedInByIdx: 2, checkedOutByIdx: 0 },
    { studentIdx: 3, carrierIdx: 0, senderIdx: 2, arrivedDaysAgo: 12, pickedUpDaysAgo: 9,  deliveredToOffice: true,  checkedInByIdx: 0, checkedOutByIdx: 2 },

    // Mix of additional packages
    { studentIdx: 1, carrierIdx: 3, senderIdx: 0, arrivedDaysAgo: 2,  deliveredToOffice: false, checkedInByIdx: 1 },
    { studentIdx: 5, carrierIdx: 2, senderIdx: 1, arrivedDaysAgo: 9,  pickedUpDaysAgo: 7,  deliveredToOffice: false, checkedInByIdx: 3, checkedOutByIdx: 1 },
    { studentIdx: 7, carrierIdx: 0, senderIdx: 4, arrivedDaysAgo: 3,  deliveredToOffice: false, checkedInByIdx: 2, notes: 'Student notified via email' },
  ];

  for (const def of packageDefs) {
    const arrivedDate = daysAgo(def.arrivedDaysAgo);
    const pickedUpDate = def.pickedUpDaysAgo != null ? daysAgo(def.pickedUpDaysAgo) : null;

    await prisma.package.create({
      data: {
        recipient:    { connect: { id: students[def.studentIdx].id } },
        carrier:      { connect: { id: carriers[def.carrierIdx].id } },
        sender:       { connect: { id: senders[def.senderIdx].id } },
        dateArrived:  arrivedDate,
        datePickedUp: pickedUpDate,
        deliveredToOffice: def.deliveredToOffice,
        checkedInBy:  { connect: { id: secretaries[def.checkedInByIdx].id } },
        checkedOutBy: def.checkedOutByIdx != null
          ? { connect: { id: secretaries[def.checkedOutByIdx].id } }
          : undefined,
        notes:            def.notes ?? null,
        notificationSent: true,
      },
    });
  }
  console.log(`  ${packageDefs.length} packages seeded`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
