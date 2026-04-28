import { PrismaClient, Role, PackageStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Secretaries ──────────────────────────────────────────────────────────
  const secretaryData = [
    { netId: 'sjensen2',  fullName: 'Sarah Jensen',   email: 'mjohans0@byu.edu'  },
    { netId: 'tbrown5',   fullName: 'Tyler Brown',    email: 'mjohans0@byu.edu'   },
    { netId: 'amiller3',  fullName: 'Ashley Miller',  email: 'mjohans0@byu.edu'  },
    { netId: 'rmorgan1',  fullName: 'Rachel Morgan',  email: 'mjohans0@byu.edu'  },
  ];

  const secretaries = await Promise.all(
    secretaryData.map((s) =>
      prisma.user.upsert({
        where: { netId: s.netId },
        update: {},
        create: { ...s, role: Role.SECRETARY },
      })
    )
  );
  console.log(`  ${secretaries.length} secretaries seeded`);

  // ── Students ─────────────────────────────────────────────────────────────
  const studentData = [
    { netId: 'mjohans0',  fullName: 'Michelle Johanson', email: 'mjohans0@byu.edu'  },
    { netId: 'ksmith4',   fullName: 'Kyle Smith',        email: 'mjohans0@byu.edu'   },
    { netId: 'lnelson7',  fullName: 'Lily Nelson',       email: 'mjohans0@byu.edu'  },
    { netId: 'dcarter2',  fullName: 'David Carter',      email: 'mjohans0@byu.edu'  },
    { netId: 'ewhite9',   fullName: 'Emma White',        email: 'mjohans0@byu.edu'   },
    { netId: 'blee6',     fullName: 'Brandon Lee',       email: 'mjohans0@byu.edu'     },
    { netId: 'ngarcia3',  fullName: 'Natalie Garcia',    email: 'mjohans0@byu.edu'  },
    { netId: 'jwilson8',  fullName: 'Jacob Wilson',      email: 'mjohans0@byu.edu'  },
  ];

  const students = await Promise.all(
    studentData.map((s) =>
      prisma.user.upsert({
        where: { netId: s.netId },
        update: {},
        create: { ...s, role: Role.STUDENT },
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
        create: { name, hidden: false, order: i },
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
        create: { name, hidden: false, order: i },
      })
    )
  );
  console.log(`  ${senders.length} senders seeded`);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const daysAgo = (n: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min: number, max: number): number => 
    Math.floor(Math.random() * (max - min + 1)) + min;
  const randomBool = (probability = 0.5): boolean => Math.random() < probability;

  // ── Packages ──────────────────────────────────────────────────────────────
  await prisma.package.deleteMany();

  const NUM_PACKAGES = 50; // Generate 50 random packages
  const noteOptions = [
    'Fragile — handle with care',
    'Two boxes — kept together',
    'Large package',
    'Small envelope',
    'Delivered to lab directly',
    'Student notified via email',
    'Friend picked up on their behalf',
    'Package missing from shelf - investigating',
    'Box crushed, contents appear intact',
    'Wrong address - returned to sender',
    'Student requested hold until next week',
    null, null, null, null, // More likely to have no notes
  ];

  const statusWeights = [
    { status: PackageStatus.ACTIVE, weight: 30 },           // 30% active
    { status: PackageStatus.PICKED_UP, weight: 50 },        // 50% picked up
    { status: PackageStatus.DELIVERED, weight: 15 },        // 15% delivered
    { status: PackageStatus.LOST, weight: 2 },              // 2% lost
    { status: PackageStatus.DAMAGED, weight: 2 },           // 2% damaged
    { status: PackageStatus.RETURNED, weight: 0.5 },        // 0.5% returned
    { status: PackageStatus.HELD, weight: 0.5 },            // 0.5% held
  ];

  const getWeightedStatus = (): PackageStatus => {
    const total = statusWeights.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * total;
    
    for (const { status, weight } of statusWeights) {
      random -= weight;
      if (random <= 0) return status;
    }
    
    return PackageStatus.ACTIVE; // Fallback
  };

  for (let i = 0; i < NUM_PACKAGES; i++) {
    const status = getWeightedStatus();
    const isActive = status === PackageStatus.ACTIVE || status === PackageStatus.HELD;
    const arrivedDaysAgo = randomInt(0, 30);
    const pickedUpDaysAgo = isActive ? null : randomInt(0, arrivedDaysAgo);
    const deliveredToOffice = status === PackageStatus.DELIVERED;
    
    const recipient = randomItem(students);
    const carrier = randomItem(carriers);
    const sender = randomItem(senders);
    const checkedInBy = randomItem(secretaries);
    const checkedOutBy = pickedUpDaysAgo !== null ? randomItem(secretaries) : null;
    
    // 10% chance someone else picked it up (if picked up)
    const someoneElsePickedUp = pickedUpDaysAgo !== null && randomBool(0.1);
    const pickedUpBy = pickedUpDaysAgo !== null 
      ? (someoneElsePickedUp ? randomItem(students) : recipient)
      : null;

    await prisma.package.create({
      data: {
        recipientId: recipient.id,
        carrierId: carrier.id,
        senderId: sender.id,
        dateArrived: daysAgo(arrivedDaysAgo),
        datePickedUp: pickedUpDaysAgo !== null ? daysAgo(pickedUpDaysAgo) : null,
        deliveredToOffice,
        checkedInById: checkedInBy.id,
        checkedOutById: checkedOutBy?.id,
        pickedUpByUserId: pickedUpBy?.id,
        notes: randomItem(noteOptions),
        status,
        notificationSent: randomBool(0.8), // 80% sent notifications
      },
    });
  }
  
  console.log(`  ${NUM_PACKAGES} packages seeded`);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());