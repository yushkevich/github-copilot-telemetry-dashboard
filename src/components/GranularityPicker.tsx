'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function GranularityPicker() {
  const router = useRouter();
  const sp = useSearchParams();
  const g = sp.get('g') || 'day';
  const set = (val: string) => {
    const p = new URLSearchParams(sp.toString());
    p.set('g', val);
    router.push('/?' + p.toString());
  };
  return (
    <div className="flex gap-2">
      <button className={g === 'day' ? 'px-3 py-1 rounded border bg-blue-600 text-white' : 'px-3 py-1 rounded border'} onClick={() => set('day')}>Day</button>
      <button className={g === 'week' ? 'px-3 py-1 rounded border bg-blue-600 text-white' : 'px-3 py-1 rounded border'} onClick={() => set('week')}>Week</button>
    </div>
  );
}
