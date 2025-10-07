import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const SALT_FILE = path.resolve(process.cwd(), '.anonymizer-salt');

export async function getSalt(): Promise<string> {
  const envSalt = process.env.ANON_SALT;
  if (envSalt && envSalt.length > 0) return envSalt;
  try {
    const data = await fs.readFile(SALT_FILE, 'utf8');
    return data.trim();
  } catch {
    const salt = crypto.randomBytes(16).toString('hex');
    await fs.writeFile(SALT_FILE, salt, 'utf8');
    return salt;
  }
}

export function hash8(salt: string, value: string): string {
  const h = crypto.createHash('sha256').update(salt + value).digest('hex');
  return h.slice(0, 8);
}
