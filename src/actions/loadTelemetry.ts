'use server';
import { promises as fs } from 'fs';
import path from 'path';
import { DayMetrics, Period, TelemetryStore } from '@/src/types/copilot';
import { mergeByDate, calcKpis } from '@/src/utils/metrics';

const cache: { key?: string; store?: TelemetryStore } = {};

function getDirs() {
  const root = path.resolve(process.cwd(), '..');
  return {
    anon: path.join(root, 'telemetry_anonymized'),
    raw: path.join(root, 'telemetry'),
  };
}

async function readAll(dir: string): Promise<DayMetrics[][]> {
  let files: string[] = [];
  try { files = (await fs.readdir(dir)).filter(f => f.endsWith('.json')); } catch { return []; }
  const out: DayMetrics[][] = [];
  for (const f of files) {
    try {
      const txt = await fs.readFile(path.join(dir, f), 'utf8');
      out.push(JSON.parse(txt));
    } catch {}
  }
  return out;
}

export async function loadMergedTelemetry(period: Period): Promise<TelemetryStore> {
  const key = String(period);
  if (cache.key === key && cache.store) return cache.store;
  const { anon, raw } = getDirs();
  let arrays = await readAll(anon);
  if (arrays.length === 0) arrays = await readAll(raw);
  const merged = mergeByDate(arrays);
  const last = merged.slice(-period);
  const store = calcKpis(last);
  cache.key = key;
  cache.store = store;
  return store;
}
