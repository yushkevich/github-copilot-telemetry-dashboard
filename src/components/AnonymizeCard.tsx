'use client';
import React, { useState, useTransition } from 'react';
import { anonymizeTelemetry } from '@/src/actions/anonymize';

export function AnonymizeCard() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const run = () => start(async () => {
    setResult(null);
    const res = await anonymizeTelemetry();
    if ('error' in res) setResult(`Error: ${res.error}`);
    else setResult(`Done: filesRead=${res.filesRead}, filesWritten=${res.filesWritten}, fieldsHashed=${res.fieldsHashed}`);
  });

  return (
    <div className="rounded-lg border p-4 bg-card text-card-foreground">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Anonymize GitHub Copilot Telemetry JSON</div>
          <div className="text-sm text-muted-foreground">Reads ./telemetry and writes ./telemetry_anonymized</div>
        </div>
        <button onClick={run} disabled={pending} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{pending ? 'Anonymizing...' : 'Anonymize'}</button>
      </div>
      <div className="mt-3 flex gap-2">
        <a className="px-4 py-2 rounded border" href="/api/tools/zip" download>Download ZIP</a>
        {result && <div className="text-sm text-muted-foreground">{result}</div>}
      </div>
    </div>
  );
}
