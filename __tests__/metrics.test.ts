import { calcKpis } from '@/src/utils/metrics';
import { DayMetrics } from '@/src/types/copilot';

function day(date: string, ide: string, lang: string, suggestions: number, acceptances: number): DayMetrics {
  return {
    date,
    total_active_users: 10,
    total_engaged_users: 5,
    copilot_ide_code_completions: {
      total_engaged_users: 3,
      editors: [
        {
          name: ide,
          total_engaged_users: 3,
          models: [
            {
              name: 'default',
              total_engaged_users: 3,
              languages: [
                { name: lang, total_engaged_users: 3, total_code_suggestions: suggestions, total_code_acceptances: acceptances, total_code_lines_suggested: suggestions*10, total_code_lines_accepted: acceptances*10 },
              ],
            },
          ],
        },
      ],
    },
  };
}

test('calcKpis computes acceptance rates across two languages and IDEs', () => {
  const days: DayMetrics[] = [
    day('2025-01-01', 'vscode', 'typescript', 100, 60),
    day('2025-01-02', 'jetbrains', 'python', 50, 20),
  ];
  const store = calcKpis(days);
  expect(store.totals.acceptance_rate_suggestions).toBeCloseTo((60 + 20) / (100 + 50));
  const byIDE = Object.fromEntries(store.breakdowns.byIDE.map(x => [x.name, x.acceptance_rate_suggestions]));
  expect(byIDE['vscode']).toBeCloseTo(60 / 100);
  expect(byIDE['jetbrains']).toBeCloseTo(20 / 50);
});
