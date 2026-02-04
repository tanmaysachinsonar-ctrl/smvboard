/**
 * Script to create demo users in Supabase Auth
 * Run with: npx ts-node scripts/create-demo-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';

async function createDemoUsers() {
  console.log('🚀 Creating demo users in Supabase...\n');

  // Get or create demo organization
  let org = await prisma.organization.findFirst({
    where: { name: 'Demo Schule SMV' },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Demo Schule SMV',
      },
    });
    console.log('✅ Created organization:', org.name);
  } else {
    console.log('✅ Using existing organization:', org.name);
  }

  const demoUsers = [
    {
      email: 'owner@demo-schule.de',
      name: 'Max Mustermann',
      role: 'OWNER' as const,
    },
    {
      email: 'member@demo-schule.de',
      name: 'Lisa Schmidt',
      role: 'MEMBER' as const,
    },
    {
      email: 'viewer@demo-schule.de',
      name: 'Tom Weber',
      role: 'VIEWER' as const,
    },
  ];

  for (const userData of demoUsers) {
    try {
      // Create user in Supabase Auth
      const { error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: DEMO_PASSWORD,
        email_confirm: true, // Auto-confirm email
      });

      if (authError) {
        // User might already exist
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${userData.email} already exists in Supabase`);
        } else {
          console.error(`❌ Error creating ${userData.email} in Supabase:`, authError.message);
          continue;
        }
      } else {
        console.log(`✅ Created ${userData.email} in Supabase Auth`);
      }

      // Check if user exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existingUser) {
        // Create user in our database
        await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            role: userData.role,
            orgId: org.id,
            provider: 'email',
          },
        });
        console.log(`✅ Created ${userData.email} in local database`);
      } else {
        console.log(`✅ User ${userData.email} already exists in local database`);
      }

      console.log('');
    } catch (error: any) {
      console.error(`❌ Error processing ${userData.email}:`, error.message);
      console.log('');
    }
  }

  console.log('✅ Demo users setup complete!\n');
  console.log('📝 You can now login with:');
  console.log('   Email: owner@demo-schule.de');
  console.log('   Email: member@demo-schule.de');
  console.log('   Email: viewer@demo-schule.de');
  console.log(`   Password: ${DEMO_PASSWORD}\n`);
}

createDemoUsers()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
