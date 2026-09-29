/**
 * Travel Planet (Voyage8) — Demo Identity Seed
 *
 * Materializes the 17 role-specific TestFixturesManager accounts as real User
 * rows so that demo bearer tokens correspond to persistent identities and
 * foreign-key-backed records (audit logs, authored content) reference users
 * that exist. Password hashes are the fixture dev hashes; nothing secret is
 * invented here. Production-guarded like the master seed.
 */

import { PrismaClient, UserRoleType } from '@prisma/client';
import { TestFixturesManager } from '../lib/auth/test-fixtures';

const prisma = new PrismaClient();

function assertNonProduction() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SECURITY VIOLATION: Demo identity seeding is strictly forbidden in production!');
  }
}

async function main() {
  assertNonProduction();
  console.log('🌱 Seeding demo identities (fixture accounts -> User rows)...\n');

  const orgIds = new Set((await prisma.organization.findMany({ select: { id: true } })).map(o => o.id));
  const accounts = TestFixturesManager.getTestAccounts();

  for (const acc of accounts) {
    const primary = acc.roles?.[0] ?? 'CUSTOMER';
    const role = (Object.values(UserRoleType) as string[]).includes(primary) ? (primary as UserRoleType) : UserRoleType.CUSTOMER;
    const organizationId = acc.organizationId && orgIds.has(acc.organizationId) ? acc.organizationId : null;

    await prisma.user.upsert({
      where: { email: acc.email },
      update: { role, organizationId, isActive: true },
      create: {
        id: acc.id,
        email: acc.email,
        fullName: acc.fullName,
        passwordHash: acc.passwordHash,
        role,
        organizationId,
      },
    });
  }

  console.log(`✅ ${accounts.length} demo identities seeded.`);
  console.log('   (emails kept stable; audit/content author FKs now resolve to real users)\n');
}

main()
  .catch(e => { console.error('Demo identity seed error:', e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
