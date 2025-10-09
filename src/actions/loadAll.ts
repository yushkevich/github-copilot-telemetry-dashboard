'use server';
import { promises as fs } from 'fs';
import path from 'path';
import { DayMetrics } from '@/src/types/copilot';
import { mergeByDate } from '@/src/utils/metrics';

function dirs(){
  const root = path.resolve(process.cwd(), '..');
  return { anon: path.join(root,'telemetry_anonymized'), raw: path.join(root,'telemetry') };
}
async function readAll(dir:string){
  try {
    const files=(await fs.readdir(dir)).filter(f=>f.endsWith('.json'));
    const out: DayMetrics[][]=[];
    for(const f of files){
      try{ out.push(JSON.parse(await fs.readFile(path.join(dir,f),'utf8')));}catch{}
    }
    return out;
  } catch { return []; }
}
export async function loadMergedAll(onlyFiles?: string[]): Promise<DayMetrics[]> {
  const {anon,raw}=dirs();
  let arrays = await readAll(anon);
  let srcDir = anon;
  if(arrays.length===0) {
    arrays = await readAll(raw);
    srcDir = raw;
  }
  if (onlyFiles && onlyFiles.length) {
    // Re-read only selected files from the detected source directory
    const chosen: DayMetrics[][] = [];
    for (const f of onlyFiles) {
      try {
        const { readFile } = await import('fs/promises');
        const { join } = await import('path');
        chosen.push(JSON.parse(await readFile(join(srcDir, f), 'utf8')));
      } catch {}
    }
    arrays = chosen;
  }
  return mergeByDate(arrays);
}
