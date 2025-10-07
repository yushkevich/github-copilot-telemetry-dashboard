'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function FilePicker({ groups }: { groups: { key: 'EP-S' | 'TS' | 'Other'; files: string[] }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const selected = new Set((params.get('f') || '').split(',').filter(Boolean));
  const setSelected = (set: Set<string>) => {
    const next = Array.from(set).join(',');
    const p = new URLSearchParams(params.toString());
    if (next) p.set('f', next); else p.delete('f');
    router.push(`/?${p.toString()}`);
  };
  const toggle = (name: string) => {
    const s = new Set(selected);
    if (s.has(name)) s.delete(name); else s.add(name);
    setSelected(s);
  };
  const pickGroup = (key: string) => {
    const s = new Set<string>();
    const g = groups.find(x => x.key === key);
    if (g) g.files.forEach(f => s.add(f));
    setSelected(s);
  };
  const clearAll = () => setSelected(new Set());

  return (
    <div className="rounded-lg border p-3 bg-card text-card-foreground max-h-80 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">Files</div>
        <div className="flex gap-2">
          <button className="text-xs underline" onClick={() => pickGroup('EP-S')}>Only EP-S</button>
          <button className="text-xs underline" onClick={() => pickGroup('TS')}>Only TS</button>
          <button className="text-xs underline" onClick={clearAll}>All</button>
        </div>
      </div>
      {groups.map(g => (
        <div key={g.key} className="mb-3">
          <div className="text-xs font-medium mb-1">{g.key}</div>
          <ul className="space-y-1">
            {g.files.map(f => (
              <li key={f} className="flex items-center gap-2">
                <input type="checkbox" checked={selected.has(f)} onChange={() => toggle(f)} />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
