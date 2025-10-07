'use server';
import { promises as fs } from 'fs';
import path from 'path';

function dirs(){
  const root = path.resolve(process.cwd(), '..');
  return { anon: path.join(root,'telemetry_anonymized'), raw: path.join(root,'telemetry') };
}

export async function listTelemetryFiles(): Promise<{ source: 'anonymized' | 'raw'; files: string[] }> {
  const { anon, raw } = dirs();
  try {
    const af = (await fs.readdir(anon)).filter(f => f.endsWith('.json'));
    if (af.length) return { source: 'anonymized', files: af };
  } catch {}
  try {
    const rf = (await fs.readdir(raw)).filter(f => f.endsWith('.json'));
    return { source: 'raw', files: rf };
  } catch {
    return { source: 'raw', files: [] };
  }
}

export async function listTelemetryFilesGrouped(): Promise<{ source: 'anonymized' | 'raw'; groups: { key: 'EP-S' | 'TS' | 'Other'; files: string[] }[] }> {
  const base = await listTelemetryFiles();
  const eps: string[] = [];
  const ts: string[] = [];
  const other: string[] = [];
  for (const f of base.files) {
    const lower = f.toLowerCase();
    if (lower.includes('-ep-')) eps.push(f);
    else if (lower.includes('-ts-')) ts.push(f);
    else other.push(f);
  }
  const groups: { key: 'EP-S' | 'TS' | 'Other'; files: string[] }[] = [];
  if (eps.length) groups.push({ key: 'EP-S', files: eps });
  if (ts.length) groups.push({ key: 'TS', files: ts });
  if (other.length) groups.push({ key: 'Other', files: other });
  return { source: base.source, groups };
}
