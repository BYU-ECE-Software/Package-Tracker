import { PrismaClient, Role, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Secretaries ──────────────────────────────────────────────────────────
  const secretaryData = [
    { netId: 'sjensen2',  fullName: 'Sarah Jensen',   email: 'mjohans0@byu.edu' },
    { netId: 'tbrown5',   fullName: 'Tyler Brown',    email: 'mjohans0@byu.edu' },
    { netId: 'amiller3',  fullName: 'Ashley Miller',  email: 'mjohans0@byu.edu' },
    { netId: 'rmorgan1',  fullName: 'Rachel Morgan',  email: 'mjohans0@byu.edu' },
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
    { netId: 'mjohans0',  fullName: 'Michelle Johanson', email: 'mjohans0@byu.edu' },
    { netId: 'ksmith4',   fullName: 'Kyle Smith',        email: 'mjohans0@byu.edu' },
    { netId: 'lnelson7',  fullName: 'Lily Nelson',       email: 'mjohans0@byu.edu' },
    { netId: 'dcarter2',  fullName: 'David Carter',      email: 'mjohans0@byu.edu' },
    { netId: 'ewhite9',   fullName: 'Emma White',        email: 'mjohans0@byu.edu' },
    { netId: 'blee6',     fullName: 'Brandon Lee',       email: 'mjohans0@byu.edu' },
    { netId: 'ngarcia3',  fullName: 'Natalie Garcia',    email: 'mjohans0@byu.edu' },
    { netId: 'jwilson8',  fullName: 'Jacob Wilson',      email: 'mjohans0@byu.edu' },
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

  // ── Vendors ──────────────────────────────────────────────────────────────
  const vendorNames = ['ThorLabs', 'McMaster Carr', 'Mouser', 'DigiKey', 'Amazon'];

  const vendors = await Promise.all(
    vendorNames.map((name, i) =>
      prisma.vendor.upsert({
        where: { name },
        update: {},
        create: { name, hidden: false, order: i },
      })
    )
  );
  console.log(`  ${vendors.length} vendors seeded`);

  // ── Professors ───────────────────────────────────────────────────────────
  const professorData = [
    { firstName: 'Brad',     lastName: 'Hutchings',  title: 'Dr.',         email: 'hutchings@ee.byu.edu' },
    { firstName: 'Karl',     lastName: 'Warnick',    title: 'Dr.',         email: 'warnick@ee.byu.edu' },
    { firstName: 'Cammy',    lastName: 'Peterson',   title: 'Dr.',         email: 'peterson@ee.byu.edu' },
    { firstName: 'David',    lastName: 'Long',       title: 'Dr.',         email: 'long@ee.byu.edu' },
    { firstName: 'Brian',    lastName: 'Mazzeo',     title: 'Dr.',         email: 'mazzeo@ee.byu.edu' },
    { firstName: 'Aaron',    lastName: 'Hawkins',    title: 'Dr.',         email: 'hawkins@ee.byu.edu' },
    { firstName: 'Greg',     lastName: 'Nordin',     title: 'Dr.',         email: 'nordin@ee.byu.edu' },
    { firstName: 'Stephen', lastName: 'Schultz',    title: 'Department Chair', email: 'schultz@ee.byu.edu' },
  ];

  const professors = await Promise.all(
    professorData.map((p) =>
      prisma.professor.upsert({
        where: { id: `seed-${p.lastName.toLowerCase()}` },
        update: {},
        create: { id: `seed-${p.lastName.toLowerCase()}`, ...p },
      })
    )
  );
  console.log(`  ${professors.length} professors seeded`);

  // ── Spend Categories ─────────────────────────────────────────────────────
  // "Other" is required — controllers protect it from edit/delete.
  const spendCategoryData = [
    { code: 'Other',    description: 'Enter manually',                       visibleToStudents: true },
    { code: 'SC0211',   description: 'Lab Supplies',                         visibleToStudents: true },
    { code: 'SC0212',   description: 'Office Supplies',                      visibleToStudents: true },
    { code: 'SC0220',   description: 'Computer Hardware (Non-Capitalized)',  visibleToStudents: true },
    { code: 'SC0221',   description: 'Computer Software (Non-Capitalized)',  visibleToStudents: true },
    { code: 'SC0301',   description: 'Books and Subscriptions',              visibleToStudents: true },
    { code: 'SC0410',   description: 'Travel — Airfare',                     visibleToStudents: false },
    { code: 'SC0411',   description: 'Travel — Lodging',                     visibleToStudents: false },
  ];

  const spendCategories = await Promise.all(
    spendCategoryData.map((sc) =>
      prisma.spendCategory.upsert({
        where: { code: sc.code },
        update: {},
        create: sc,
      })
    )
  );
  console.log(`  ${spendCategories.length} spend categories seeded`);

  // ── Line Memo Options ────────────────────────────────────────────────────
  // IDs are real BYU/Workday line memo codes — admins enter them manually.
  // Placeholder values for dev; replace with real codes when known.
  const lineMemoData = [
    { id: 1001, description: 'General Lab Operations' },
    { id: 1002, description: 'Research — Capstone Projects' },
    { id: 1003, description: 'Department Credit Card — Misc' },
    { id: 2001, description: 'Faculty Travel' },
  ];

  const lineMemos = await Promise.all(
    lineMemoData.map((lm) =>
      prisma.lineMemoOption.upsert({
        where: { id: lm.id },
        update: {},
        create: lm,
      })
    )
  );
  console.log(`  ${lineMemos.length} line memo options seeded`);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const daysAgo = (n: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const randomBool = (probability = 0.5): boolean => Math.random() < probability;

  // ── Packages ─────────────────────────────────────────────────────────────
  await prisma.package.deleteMany();

  const NUM_PACKAGES = 50;
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
    null, null, null, null,
  ];

  for (let i = 0; i < NUM_PACKAGES; i++) {
    const roll = Math.random();
    const isActive = roll < 0.3;
    const deliveredToOffice = !isActive && roll < 0.45;

    const arrivedDaysAgo = randomInt(0, 30);
    const pickedUpDaysAgo = isActive ? null : randomInt(0, arrivedDaysAgo);

    const recipient = randomItem(students);
    const carrier = randomItem(carriers);
    const vendor = randomItem(vendors);
    const checkedInBy = randomItem(secretaries);
    const checkedOutBy = pickedUpDaysAgo !== null ? randomItem(secretaries) : null;

    const someoneElsePickedUp = pickedUpDaysAgo !== null && randomBool(0.1);
    const pickedUpBy = pickedUpDaysAgo !== null
      ? (someoneElsePickedUp ? randomItem(students) : recipient)
      : null;

    await prisma.package.create({
      data: {
        recipientId: recipient.id,
        carrierId: carrier.id,
        vendorId: vendor.id,
        dateArrived: daysAgo(arrivedDaysAgo),
        datePickedUp: pickedUpDaysAgo !== null ? daysAgo(pickedUpDaysAgo) : null,
        deliveredToOffice,
        checkedInById: checkedInBy.id,
        checkedOutById: checkedOutBy?.id,
        pickedUpByUserId: pickedUpBy?.id,
        notes: randomItem(noteOptions),
      },
    });
  }
  console.log(`  ${NUM_PACKAGES} packages seeded`);

  // ── Orders ───────────────────────────────────────────────────────────────
  await prisma.item.deleteMany();
  await prisma.order.deleteMany();

  const NUM_ORDERS = 30;
  const purposeOptions = [
    'Capstone project — autonomous robot',
    'Senior thesis — RF measurement system',
    'Replacement parts for teaching lab',
    'Research equipment for signal processing',
    'Components for student-led IEEE project',
    'Maintenance supplies for clean room',
    'New oscilloscope probes for lab kit',
    'Soldering station replacements',
  ];

  const itemNameOptions = [
    'Resistor pack (1/4W, 1% tolerance)',
    'Breadboard, full-size',
    'Jumper wire kit',
    'Arduino Uno R3',
    'Raspberry Pi 4 Model B',
    'Multimeter — Fluke 117',
    'Soldering iron — Hakko FX-888D',
    'Oscilloscope probe, 100MHz',
    'Function generator',
    'Logic analyzer, 8-channel',
    'Power supply, bench top',
    'Capacitor assortment kit',
    'IC sockets, DIP-8',
    'Heat shrink tubing kit',
    'BNC cable, 3ft',
    'USB-C breakout board',
  ];

  const workTagOptions = ['CC0001', 'CC0042', 'PRJ-2024-117', 'PRJ-2024-203', 'GRANT-NSF-9912'];
  const shippingOptions = ['Standard', '2-Day', 'Overnight', null];
  const cartLinkOptions = [
    'https://www.thorlabs.com/cart/share/abc123',
    'https://www.mouser.com/cart/shared/xyz789',
    null,
    null,
  ];

  const statusValues: Status[] = [
    Status.REQUESTED,
    Status.PURCHASED,
    Status.COMPLETED,
    Status.CANCELLED,
  ];

  for (let i = 0; i < NUM_ORDERS; i++) {
    const requester = randomItem(students);
    const vendor = randomItem(vendors);
    const professor = randomItem(professors);
    const spendCategory = randomItem(spendCategories);
    const lineMemo = randomBool(0.3) ? randomItem(lineMemos) : null;
    const status = randomItem(statusValues);
    const isPurchasedOrLater = status !== Status.REQUESTED && status !== Status.CANCELLED;

    const purchaser = isPurchasedOrLater ? randomItem(secretaries) : null;
    const requestedDaysAgo = randomInt(1, 60);
    const purchasedDaysAgo = isPurchasedOrLater
      ? randomInt(0, Math.max(0, requestedDaysAgo - 1))
      : null;

    const total = parseFloat((Math.random() * 800 + 20).toFixed(2));
    const tax = parseFloat((total * 0.0775).toFixed(2));

    const numItems = randomInt(1, 4);
    const itemsToCreate = Array.from({ length: numItems }, () => ({
      name: randomItem(itemNameOptions),
      quantity: randomInt(1, 10),
      status,
      link: randomBool(0.4) ? 'https://www.example.com/product/12345' : null,
    }));

    await prisma.order.create({
      data: {
        requestDate: daysAgo(requestedDaysAgo),
        status,
        shippingPreference: randomItem(shippingOptions),
        purpose: randomItem(purposeOptions),
        workTag: randomItem(workTagOptions),
        cartLink: randomItem(cartLinkOptions),
        comment: randomBool(0.3) ? 'Please order ASAP — needed for upcoming demo' : null,
        tax: isPurchasedOrLater ? tax : null,
        total: isPurchasedOrLater ? total : null,
        userId: requester.id,
        vendorId: vendor.id,
        professorId: professor.id,
        spendCategoryId: spendCategory.id,
        lineMemoOptionId: lineMemo?.id,
        purchasedById: purchaser?.id,
        creditCard: isPurchasedOrLater ? randomBool(0.4) : null,
        purchaseDate: purchasedDaysAgo !== null ? daysAgo(purchasedDaysAgo) : null,
        adminComment: randomBool(0.2) ? 'Confirmed with vendor — ETA 5 business days' : null,
        items: {
          create: itemsToCreate,
        },
      },
    });
  }
  console.log(`  ${NUM_ORDERS} orders seeded (with items)`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());