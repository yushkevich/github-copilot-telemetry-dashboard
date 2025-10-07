'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

type Point = { date: string; active?: number; engaged?: number };

export function UsersTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="rounded-lg border p-4 bg-card text-card-foreground">
      <div className="text-sm text-muted-foreground mb-2">Active vs Engaged users (7-day moving average)</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" hide />
          <YAxis width={50} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="active" name="Active" stroke="#6366f1" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="engaged" name="Engaged" stroke="#f59e0b" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


