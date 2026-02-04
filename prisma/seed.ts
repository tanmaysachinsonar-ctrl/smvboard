import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.account.deleteMany();
  await prisma.member.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Schule SMV',
      stripeCustomerId: 'cus_demo123',
    },
  });

  console.log('Created organization:', org.name);

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const owner = await prisma.user.create({
    data: {
      email: 'owner@demo-schule.de',
      name: 'Max Mustermann',
      role: 'OWNER',
      passwordHash: hashedPassword,
      orgId: org.id,
      provider: 'email',
    },
  });

  const member = await prisma.user.create({
    data: {
      email: 'member@demo-schule.de',
      name: 'Lisa Schmidt',
      role: 'MEMBER',
      passwordHash: hashedPassword,
      orgId: org.id,
      provider: 'email',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@demo-schule.de',
      name: 'Tom Weber',
      role: 'VIEWER',
      passwordHash: hashedPassword,
      orgId: org.id,
      provider: 'email',
    },
  });

  console.log('Created users:', [owner, member, viewer].map(u => u.email));

  // Create members (students in SMV)
  const members = await prisma.member.createMany({
    data: [
      {
        orgId: org.id,
        name: 'Anna Müller',
        position: 'Schülersprecherin',
        email: 'anna.mueller@demo-schule.de',
        phone: '+49 151 12345678',
      },
      {
        orgId: org.id,
        name: 'Jonas Becker',
        position: 'Stellvertretender Schülersprecher',
        email: 'jonas.becker@demo-schule.de',
        phone: '+49 152 23456789',
      },
      {
        orgId: org.id,
        name: 'Sarah Fischer',
        position: 'Kassenwartin',
        email: 'sarah.fischer@demo-schule.de',
      },
      {
        orgId: org.id,
        name: 'Leon Hoffmann',
        position: 'Event-Koordinator',
        email: 'leon.hoffmann@demo-schule.de',
      },
    ],
  });

  console.log('Created members:', members.count);

  // Create accounts
  const cashAccount = await prisma.account.create({
    data: {
      orgId: org.id,
      name: 'Hauptkasse',
      type: 'CASH',
      balance: 1500.50,
    },
  });

  const bankAccount = await prisma.account.create({
    data: {
      orgId: org.id,
      name: 'Girokonto Sparkasse',
      type: 'BANK',
      balance: 8420.75,
    },
  });

  const grantAccount = await prisma.account.create({
    data: {
      orgId: org.id,
      name: 'Fördergelder Stadt',
      type: 'GRANT',
      balance: 5000.00,
    },
  });

  console.log('Created accounts:', [cashAccount, bankAccount, grantAccount].map(a => a.name));

  // Create categories
  const incomeCategories = await prisma.category.createMany({
    data: [
      { orgId: org.id, name: 'Spenden', kind: 'INCOME' },
      { orgId: org.id, name: 'Veranstaltungseinnahmen', kind: 'INCOME' },
      { orgId: org.id, name: 'Fördergelder', kind: 'INCOME' },
      { orgId: org.id, name: 'Verkauf', kind: 'INCOME' },
    ],
  });

  const expenseCategories = await prisma.category.createMany({
    data: [
      { orgId: org.id, name: 'Hardware', kind: 'EXPENSE' },
      { orgId: org.id, name: 'Veranstaltungen', kind: 'EXPENSE' },
      { orgId: org.id, name: 'Büromaterial', kind: 'EXPENSE' },
      { orgId: org.id, name: 'Catering', kind: 'EXPENSE' },
      { orgId: org.id, name: 'Sonstiges', kind: 'EXPENSE' },
    ],
  });

  console.log('Created categories:', incomeCategories.count + expenseCategories.count);

  // Get categories for transactions
  const donationCat = await prisma.category.findFirst({ where: { name: 'Spenden' } });
  const eventIncomeCat = await prisma.category.findFirst({ where: { name: 'Veranstaltungseinnahmen' } });
  const hardwareCat = await prisma.category.findFirst({ where: { name: 'Hardware' } });
  const cateringCat = await prisma.category.findFirst({ where: { name: 'Catering' } });

  // Create transactions
  const transactions = await prisma.transaction.createMany({
    data: [
      {
        orgId: org.id,
        accountId: bankAccount.id,
        amount: 1200.00,
        currency: 'EUR',
        date: new Date('2025-01-05'),
        type: 'INCOME',
        categoryId: eventIncomeCat?.id,
        description: 'Spendenlauf Einnahme',
        createdById: owner.id,
        reconciled: true,
      },
      {
        orgId: org.id,
        accountId: bankAccount.id,
        amount: -350.00,
        currency: 'EUR',
        date: new Date('2025-01-10'),
        type: 'EXPENSE',
        categoryId: hardwareCat?.id,
        description: 'Beamerkauf für Aula',
        createdById: owner.id,
        reconciled: true,
      },
      {
        orgId: org.id,
        accountId: cashAccount.id,
        amount: 450.00,
        currency: 'EUR',
        date: new Date('2025-01-15'),
        type: 'INCOME',
        categoryId: donationCat?.id,
        description: 'Spende von Elternbeirat',
        createdById: member.id,
        reconciled: false,
      },
      {
        orgId: org.id,
        accountId: cashAccount.id,
        amount: -125.50,
        currency: 'EUR',
        date: new Date('2025-01-20'),
        type: 'EXPENSE',
        categoryId: cateringCat?.id,
        description: 'Catering Schulveranstaltung',
        createdById: member.id,
        reconciled: false,
      },
      {
        orgId: org.id,
        accountId: grantAccount.id,
        amount: 5000.00,
        currency: 'EUR',
        date: new Date('2025-01-01'),
        type: 'INCOME',
        categoryId: null,
        description: 'Fördergelder Stadt für 2025',
        createdById: owner.id,
        reconciled: true,
      },
    ],
  });

  console.log('Created transactions:', transactions.count);

  // Create events
  const event1 = await prisma.event.create({
    data: {
      orgId: org.id,
      title: 'SMV-Vollversammlung',
      description: 'Monatliche Vollversammlung aller SMV-Mitglieder',
      start: new Date('2025-02-15T14:00:00'),
      end: new Date('2025-02-15T16:00:00'),
      location: 'Aula',
      createdById: owner.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      orgId: org.id,
      title: 'Schulfest',
      description: 'Jährliches Sommerfest mit Ständen und Aufführungen',
      start: new Date('2025-07-10T10:00:00'),
      end: new Date('2025-07-10T18:00:00'),
      location: 'Schulhof',
      createdById: member.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      orgId: org.id,
      title: 'Workshop: Projektmanagement',
      description: 'Interner Workshop für SMV-Mitglieder',
      start: new Date('2025-03-20T15:00:00'),
      end: new Date('2025-03-20T17:30:00'),
      location: 'Raum 201',
      createdById: owner.id,
    },
  });

  console.log('Created events:', [event1, event2, event3].map(e => e.title));

  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      orgId: org.id,
      stripeSubscriptionId: 'sub_demo123',
      planId: 'price_premium',
      status: 'active',
      currentPeriodEnd: new Date('2025-12-31'),
    },
  });

  console.log('Created subscription:', subscription.planId);

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        orgId: org.id,
        userId: owner.id,
        action: 'ORGANIZATION_CREATED',
        meta: { name: org.name },
      },
      {
        orgId: org.id,
        userId: owner.id,
        action: 'USER_INVITED',
        meta: { email: member.email },
      },
      {
        orgId: org.id,
        userId: member.id,
        action: 'TRANSACTION_CREATED',
        meta: { amount: 450, description: 'Spende von Elternbeirat' },
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
