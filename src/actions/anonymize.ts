'use server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSalt } from '@/src/utils/crypto';
import { anonymizeDay } from '@/src/utils/anonymizer';
import { DayMetrics } from '@/src/types/copilot';

function getPaths() {
  const root = path.resolve(process.cwd(), '..');
  const rawDir = path.join(root, 'telemetry');
  const outDir = path.join(root, 'telemetry_anonymized');
  return { root, rawDir, outDir };
}

export async function anonymizeTelemetry() {
  const { rawDir, outDir } = getPaths();
  let filesRead = 0;
  let filesWritten = 0;
  let fieldsHashed = 0;
  const salt = await getSalt();

  try { await fs.mkdir(outDir, { recursive: true }); } catch {}

  let entries: string[] = [];
  try {
    entries = (await fs.readdir(rawDir)).filter(f => f.endsWith('.json'));
  } catch {
    return { filesRead, filesWritten, fieldsHashed, error: 'Raw telemetry folder not found' } as const;
  }

  for (const name of entries) {
    const inPath = path.join(rawDir, name);
    const outPath = path.join(outDir, name);
    try {
      const raw = await fs.readFile(inPath, 'utf8');
      const data = JSON.parse(raw) as DayMetrics[];
      filesRead++;
      const out = data.map(d => {
        const before = JSON.stringify(d);
        const anon = anonymizeDay(d, { salt });
        const after = JSON.stringify(anon);
        // rough heuristic: count occurrences of 'model-' and 'repo-' newly introduced
        const newModel = (after.match(/model-/g) || []).length - (before.match(/model-/g) || []).length;
        const newRepo = (after.match(/repo-/g) || []).length - (before.match(/repo-/g) || []).length;
        fieldsHashed += Math.max(0, newModel) + Math.max(0, newRepo);
        return anon;
      });
      await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
      filesWritten++;
    } catch (e) {
      return { filesRead, filesWritten, fieldsHashed, error: `Failed on ${name}: ${(e as Error).message}` } as const;
    }
  }

  return { filesRead, filesWritten, fieldsHashed } as const;
}

export async function listAnonymizedFiles() {
  const { outDir } = getPaths();
  try {
    return (await fs.readdir(outDir)).filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
}
