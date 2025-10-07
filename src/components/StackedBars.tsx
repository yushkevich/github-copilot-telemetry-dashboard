'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = { data: { date: string; suggestions: number; acceptances: number }[] };

export function StackedBars({ data }: Props) {
  return (
    <div className="rounded-lg border p-4 bg-card text-card-foreground">
      <div className="text-sm text-muted-foreground mb-2">Suggestions vs Acceptances</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" hide />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="suggestions" stackId="a" fill="#93c5fd" name="Suggestions" />
          <Bar dataKey="acceptances" stackId="a" fill="#60a5fa" name="Acceptances" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
