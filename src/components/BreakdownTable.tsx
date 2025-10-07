'use client';
import React from 'react';

type Row = { name: string; engaged_users: number; acceptance_rate_suggestions: number };

type Props = { title: string; rows: Row[] };

export function BreakdownTable({ title, rows }: Props) {
  return (
    <div className="rounded-lg border p-4 bg-card text-card-foreground">
      <div className="text-sm text-muted-foreground mb-2">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2">Name</th>
              <th className="py-2">Engaged users</th>
              <th className="py-2">Acceptance rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="py-2">{r.name}</td>
                <td className="py-2">{r.engaged_users.toLocaleString()}</td>
                <td className="py-2">{(r.acceptance_rate_suggestions * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
