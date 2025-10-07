'use client';
import React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  value: string;
  delta?: number; // fraction, e.g., 0.12 => +12%
  tooltip: string;
};

export function KpiCard({ title, value, delta, tooltip }: Props) {
  const formattedDelta = typeof delta === 'number' ? `${delta >= 0 ? '▲' : '▼'} ${(Math.abs(delta) * 100).toFixed(1)}%` : undefined;
  return (
    <div className="rounded-lg border p-4 bg-card text-card-foreground">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{title}</span>
          <span className="cursor-help" title={tooltip}>ⓘ</span>
        </div>
        {formattedDelta && (
          <span className={cn('text-sm font-medium', delta && delta < 0 ? 'text-red-600' : 'text-green-600')}>{formattedDelta}</span>
        )}
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}
