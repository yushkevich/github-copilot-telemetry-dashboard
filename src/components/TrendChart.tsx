'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Props = {
  data: { date: string; suggestionsRate?: number; linesRate?: number }[];
  show: 'suggestions' | 'lines';
};

export function TrendChart({ data, show }: Props) {
  return (
    <div className="rounded-lg border p-4 bg-card text-card-foreground">
      <div className="text-sm text-muted-foreground mb-2">Acceptance rate trend (7-day moving average)</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ left: 8, right: 8 }}>
          <XAxis dataKey="date" hide />
          <YAxis domain={[0, 1]} tickFormatter={v => `${Math.round(v * 100)}%`} width={40} />
          <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
          <Legend />
          {show === 'suggestions' && <Line type="monotone" dataKey="suggestionsRate" name="Suggestions" stroke="#3b82f6" dot={false} strokeWidth={2} />}
          {show === 'lines' && <Line type="monotone" dataKey="linesRate" name="Lines" stroke="#10b981" dot={false} strokeWidth={2} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
