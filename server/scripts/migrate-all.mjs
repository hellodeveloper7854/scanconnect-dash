// Applies pending Prisma migrations to BOTH databases — live (DATABASE_URL) and
// test (TEST_DATABASE_URL, if set) — so a schema change can never be deployed to
// one environment and forgotten in the other.
//
//   npm run prisma:migrate:all
//
// Each database is attempted even if the other fails; the exit code is non-zero
// if any of them failed (e.g. the test database refusing this machine's IP).
import 'dotenv/config';
import { spawnSync } from 'node:child_process';

const targets = [
  ['live', process.env.DATABASE_URL],
  ['test', process.env.TEST_DATABASE_URL],
];

let failed = false;
for (const [name, url] of targets) {
  if (!url) {
    console.log(`\n== ${name}: skipped (no URL configured) ==`);
    continue;
  }
  console.log(`\n== ${name}: prisma migrate deploy ==`);
  const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    failed = true;
    console.error(`\n!! ${name}: migration FAILED (exit ${result.status})`);
  }
}
process.exit(failed ? 1 : 0);
