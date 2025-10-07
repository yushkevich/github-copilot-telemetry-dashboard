'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function PeriodPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const p = Number(params.get('p') || 28) as 7 | 28 | 90 | 100;
  const options: (7 | 28 | 90 | 100)[] = [7, 28, 90, 100];
  return (
    <div className="flex gap-2">
      {options.map((o) => {
        const active = p === o;
        return (
          <button
            key={o}
            onClick={() => router.push(`/?p=${o}`)}
            className={`px-3 py-1 rounded border ${active ? 'bg-blue-600 text-white' : 'bg-card'}`}
          >
            {o}d
          </button>
        );
      })}
    </div>
  );
}
