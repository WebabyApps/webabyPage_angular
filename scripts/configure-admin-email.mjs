import { readFile, writeFile } from 'node:fs/promises';

const targetFile = process.argv[2] ?? 'src/environments/environment.prod.ts';
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!adminEmail) {
  throw new Error('ADMIN_EMAIL is required');
}

const source = await readFile(targetFile, 'utf8');
const adminEmailPattern = /adminEmail:\s*(['"])[^'"]*\1/;

if (!adminEmailPattern.test(source)) {
  throw new Error(`Could not find adminEmail in ${targetFile}`);
}

const configuredSource = source.replace(
  adminEmailPattern,
  `adminEmail: ${JSON.stringify(adminEmail)}`,
);

await writeFile(targetFile, configuredSource);
console.log(`Configured browser admin email in ${targetFile}`);
