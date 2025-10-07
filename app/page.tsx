import { loadMergedAll } from '@/src/actions/loadAll';
import { KpiCard } from '@/src/components/KpiCard';
import { TrendChart } from '@/src/components/TrendChart';
import { StackedBars } from '@/src/components/StackedBars';
import { BreakdownTable } from '@/src/components/BreakdownTable';
import { PeriodPicker } from '@/src/components/PeriodPicker';
import { FilePicker } from '@/src/components/FilePicker';
import { listTelemetryFilesGrouped } from '@/src/actions/files';
import { calcKpis } from '@/src/utils/metrics';
import { aggregateByWeek } from '@/src/utils/metrics';
import { GranularityPicker } from '@/src/components/GranularityPicker';
import { UsersTrendChart } from '@/src/components/UsersTrendChart';

function formatPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ p?: string, f?: string, g?: string, cstart?: string, cend?: string }> }) {
  const sp = await searchParams;
  const period = (Number(sp?.p ?? 28) as 7 | 28 | 90 | 100);
  const selectedFiles = sp?.f ? sp.f.split(',').filter(Boolean) : undefined;
  const granularity = (sp?.g === 'week' ? 'week' : 'day') as 'day' | 'week';
  const compareStart = sp?.cstart; // optional YYYY-MM-DD
  const compareEnd = sp?.cend; // optional YYYY-MM-DD
  const [filesInfo, merged] = await Promise.all([
    listTelemetryFilesGrouped(),
    loadMergedAll(selectedFiles),
  ]);
  const baseDays = granularity === 'week' ? aggregateByWeek(merged) : merged;
  const currentDays = baseDays.slice(-period);
  const prevDays = baseDays.slice(-(period * 2), -period);
  // If custom comparison range provided, use that instead of prevDays
  let compareDays = prevDays;
  if (compareStart && compareEnd) {
    compareDays = baseDays.filter(d => d.date >= compareStart && d.date <= compareEnd);
  }
  const store = calcKpis(currentDays);
  const prev = compareDays.length ? calcKpis(compareDays) : undefined;
  const days = store.days;

  // simple 7-day MA computed here to keep client lean
  const window = 7;
  function ma(arr: number[]) {
    const out: number[] = []; let sum = 0;
    for (let i = 0; i < arr.length; i++) { sum += arr[i]; if (i >= window) sum -= arr[i-window]; out.push(i+1>=window? sum/window : sum/(i+1)); }
    return out;
  }
  const sugRates = ma(days.map(d => d.suggestions > 0 ? d.acceptances / d.suggestions : 0));
  const linRates = ma(days.map(d => d.lines_suggested > 0 ? d.lines_accepted / d.lines_suggested : 0));
  const trendData = days.map((d, i) => ({ date: d.date, suggestionsRate: sugRates[i], linesRate: linRates[i] }));

  const barData = days.map(d => ({ date: d.date, suggestions: d.suggestions, acceptances: d.acceptances }));

  // Active vs Engaged users (7-day MA)
  const activeMA = ma(days.map(d => d.active_users));
  const engagedMA = ma(days.map(d => d.engaged_users));
  const usersTrend = days.map((d, i) => ({ date: d.date, active: activeMA[i], engaged: engagedMA[i] }));

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium">Dashboard</div>
        <div className="flex items-center gap-3">
          <GranularityPicker />
          <PeriodPicker />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Active users" value={store.totals.active_users.toLocaleString()} delta={prev? (store.totals.active_users - prev.totals.active_users) / Math.max(prev.totals.active_users,1) : undefined} tooltip="Active users: users with an active Copilot license using Copilot that day." />
        <KpiCard title="Engaged users" value={store.totals.engaged_users.toLocaleString()} delta={prev? (store.totals.engaged_users - prev.totals.engaged_users) / Math.max(prev.totals.engaged_users,1) : undefined} tooltip="Engaged users: users who engaged with a Copilot feature that day (e.g., accepted a suggestion, used chat)." />
        <KpiCard title="Engagement rate" value={formatPct(store.totals.engagement_rate ?? 0)} delta={prev? ((store.totals.engagement_rate ?? 0) - (prev.totals.engagement_rate ?? 0)) / Math.max((prev.totals.engagement_rate ?? 0),1e-9) : undefined} tooltip="Engagement rate = Σ total_engaged_users / Σ total_active_users." />
        <KpiCard title="IDE completions engaged" value={store.totals.completions_engaged_users.toLocaleString()} delta={prev? (store.totals.completions_engaged_users - prev.totals.completions_engaged_users) / Math.max(prev.totals.completions_engaged_users,1) : undefined} tooltip="IDE code completions engaged users equals copilot_ide_code_completions.total_engaged_users summed over the period." />
        <KpiCard title="Chat engaged" value={store.totals.chat_engaged_users.toLocaleString()} delta={prev? (store.totals.chat_engaged_users - prev.totals.chat_engaged_users) / Math.max(prev.totals.chat_engaged_users,1) : undefined} tooltip="Chat engaged: users with chat activity; include counts for total_chats, total_chat_copy_events, total_chat_insertion_events." />
        <KpiCard title="Acceptance rate (suggestions)" value={formatPct(store.totals.acceptance_rate_suggestions)} delta={prev? (store.totals.acceptance_rate_suggestions - prev.totals.acceptance_rate_suggestions) / Math.max(prev.totals.acceptance_rate_suggestions,1e-9) : undefined} tooltip="Acceptance rate (suggestions) = accepted suggestions / total suggestions." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Acceptance rate (lines)" value={formatPct(store.totals.acceptance_rate_lines)} delta={prev? (store.totals.acceptance_rate_lines - prev.totals.acceptance_rate_lines) / Math.max(prev.totals.acceptance_rate_lines,1e-9) : undefined} tooltip="Acceptance rate (lines) = accepted lines / suggested lines." />
        <KpiCard title="Mean daily active" value={(store.totals.mean_daily_active ?? 0).toFixed(1)} tooltip="Average of daily active users over the selected period." />
        <KpiCard title="Mean daily engaged" value={(store.totals.mean_daily_engaged ?? 0).toFixed(1)} tooltip="Average of daily engaged users over the selected period." />
        <KpiCard title="Dotcom chat engaged" value={(store.totals.dotcom_chat_engaged_users ?? 0).toLocaleString()} tooltip="Σ copilot_dotcom_chat.total_engaged_users." />
        <KpiCard title="PR summary engaged" value={(store.totals.pr_summary_engaged_users ?? 0).toLocaleString()} tooltip="Σ copilot_dotcom_pull_requests.total_engaged_users." />
        <KpiCard title="Chats per chat-engaged" value={(store.totals.chats_per_chat_engaged ?? 0).toFixed(2)} tooltip="Σ total_chats / Σ copilot_ide_chat.total_engaged_users." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Copy rate" value={formatPct(store.totals.chat_copy_rate ?? 0)} tooltip="Σ total_chat_copy_events / Σ total_chats." />
        <KpiCard title="Insertion rate" value={formatPct(store.totals.chat_insert_rate ?? 0)} tooltip="Σ total_chat_insertion_events / Σ total_chats." />
        <KpiCard title="Copy-to-insert ratio" value={(store.totals.chat_copy_to_insert_ratio ?? 0).toFixed(2)} tooltip="Σ total_chat_copy_events / Σ total_chat_insertion_events." />
        <KpiCard title="Suggestions per CC engaged" value={(store.totals.suggestions_per_cc_engaged ?? 0).toFixed(1)} tooltip="Σ total_code_suggestions / Σ copilot_ide_code_completions.total_engaged_users." />
        <KpiCard title="Acceptances per CC engaged" value={(store.totals.acceptances_per_cc_engaged ?? 0).toFixed(1)} tooltip="Σ total_code_acceptances / Σ copilot_ide_code_completions.total_engaged_users." />
        <KpiCard title="Chat adoption" value={formatPct(store.totals.chat_adoption ?? 0)} tooltip="Σ copilot_ide_chat.total_engaged_users / Σ total_active_users." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <TrendChart data={trendData} show="suggestions" />
          <div className="text-xs text-muted-foreground">Shows 7-day moving average of acceptance rates (suggestions vs lines).</div>
          <UsersTrendChart data={usersTrend} />
          <div className="text-xs text-muted-foreground">Active vs Engaged users over time (7-day moving average).</div>
          <StackedBars data={barData} />
          <div className="text-xs text-muted-foreground">Daily totals of code suggestions and acceptances stacked to compare volume vs adoption.</div>
        </div>
        <FilePicker groups={filesInfo.groups} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BreakdownTable title="By IDE" rows={store.breakdowns.byIDE} />
        <BreakdownTable title="By language" rows={store.breakdowns.byLanguage} />
      </div>

      <div className="text-xs text-muted-foreground">Acceptance rate is a usefulness indicator, not a direct productivity measure.</div>
    </main>
  );
}
