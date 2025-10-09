import { DayMetrics, DayAggregates, TelemetryStore, IDECodeCompletions, IDEChat, DotcomPullRequests } from '@/src/types/copilot';

export function mergeByDate(files: DayMetrics[][]): DayMetrics[] {
  const map = new Map<string, DayMetrics>();
  for (const arr of files) {
    for (const d of arr) {
      const cur = map.get(d.date);
      if (!cur) {
        map.set(d.date, JSON.parse(JSON.stringify(d)));
      } else {
        cur.total_active_users += d.total_active_users;
        cur.total_engaged_users += d.total_engaged_users;
        if (d.copilot_ide_code_completions) {
          if (!cur.copilot_ide_code_completions) {
            cur.copilot_ide_code_completions = { total_engaged_users: 0, editors: [] } as IDECodeCompletions;
          }
          cur.copilot_ide_code_completions!.total_engaged_users += d.copilot_ide_code_completions.total_engaged_users;
          cur.copilot_ide_code_completions!.editors = [
            ...(cur.copilot_ide_code_completions!.editors ?? []),
            ...(d.copilot_ide_code_completions.editors ?? []),
          ];
        }
        if (d.copilot_ide_chat) {
          if (!cur.copilot_ide_chat) {
            cur.copilot_ide_chat = { total_engaged_users: 0, editors: [] } as IDEChat;
          }
          cur.copilot_ide_chat!.total_engaged_users += d.copilot_ide_chat.total_engaged_users;
          cur.copilot_ide_chat!.editors = [
            ...(cur.copilot_ide_chat!.editors ?? []),
            ...(d.copilot_ide_chat.editors ?? []),
          ];
        }
        if (d.copilot_dotcom_chat) {
          cur.copilot_dotcom_chat = cur.copilot_dotcom_chat || { total_engaged_users: 0 };
          cur.copilot_dotcom_chat.total_engaged_users += d.copilot_dotcom_chat.total_engaged_users;
        }
        if (d.copilot_dotcom_pull_requests) {
          if (!cur.copilot_dotcom_pull_requests) {
            cur.copilot_dotcom_pull_requests = { total_engaged_users: 0 } as DotcomPullRequests;
          }
          cur.copilot_dotcom_pull_requests!.total_engaged_users += d.copilot_dotcom_pull_requests.total_engaged_users;
          cur.copilot_dotcom_pull_requests!.repositories = [
            ...(cur.copilot_dotcom_pull_requests!.repositories ?? []),
            ...(d.copilot_dotcom_pull_requests.repositories ?? []),
          ];
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function movingAverage(values: number[], window: number): number[] {
  const res: number[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= window) sum -= values[i - window];
    res.push(i + 1 >= window ? sum / window : sum / (i + 1));
  }
  return res;
}

export function aggregateByWeek(days: DayMetrics[]): DayMetrics[] {
  const map = new Map<string, DayMetrics>();
  function weekStart(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const day = date.getUTCDay(); // 0 Sun .. 6 Sat
    const diffToMonday = (day + 6) % 7; // 0 for Mon
    date.setUTCDate(date.getUTCDate() - diffToMonday);
    const ys = date.getUTCFullYear();
    const ms = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const ds = date.getUTCDate().toString().padStart(2, '0');
    return `${ys}-${ms}-${ds}`;
  }
  for (const d of days) {
    const key = weekStart(d.date);
    const cur = map.get(key);
    if (!cur) {
      map.set(key, JSON.parse(JSON.stringify(d)));
    } else {
      cur.total_active_users += d.total_active_users;
      cur.total_engaged_users += d.total_engaged_users;
      if (d.copilot_ide_code_completions) {
        if (!cur.copilot_ide_code_completions) {
          cur.copilot_ide_code_completions = { total_engaged_users: 0, editors: [] } as IDECodeCompletions;
        }
        cur.copilot_ide_code_completions!.total_engaged_users += d.copilot_ide_code_completions.total_engaged_users;
        const editors = (d.copilot_ide_code_completions.editors ?? []);
        cur.copilot_ide_code_completions!.editors = [
          ...(cur.copilot_ide_code_completions!.editors ?? []),
          ...editors,
        ];
      }
      if (d.copilot_ide_chat) {
        if (!cur.copilot_ide_chat) {
          cur.copilot_ide_chat = { total_engaged_users: 0, editors: [] } as IDEChat;
        }
        cur.copilot_ide_chat!.total_engaged_users += d.copilot_ide_chat.total_engaged_users;
        const editors = (d.copilot_ide_chat.editors ?? []);
        cur.copilot_ide_chat!.editors = [
          ...(cur.copilot_ide_chat!.editors ?? []),
          ...editors,
        ];
      }
      if (d.copilot_dotcom_chat) {
        cur.copilot_dotcom_chat = cur.copilot_dotcom_chat || { total_engaged_users: 0 };
        cur.copilot_dotcom_chat.total_engaged_users += d.copilot_dotcom_chat.total_engaged_users;
      }
      if (d.copilot_dotcom_pull_requests) {
        if (!cur.copilot_dotcom_pull_requests) {
          cur.copilot_dotcom_pull_requests = { total_engaged_users: 0 } as DotcomPullRequests;
        }
        cur.copilot_dotcom_pull_requests!.total_engaged_users += d.copilot_dotcom_pull_requests.total_engaged_users;
        const repos = (d.copilot_dotcom_pull_requests.repositories ?? []);
        cur.copilot_dotcom_pull_requests!.repositories = [
          ...(cur.copilot_dotcom_pull_requests!.repositories ?? []),
          ...repos,
        ];
      }
    }
  }
  return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>({ ...v, date: k }));
}

export function bucketTopN<T extends { name: string; value: number }>(items: T[], n: number): T[] {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, n);
  const rest = sorted.slice(n);
  if (rest.length) {
    const othersVal = rest.reduce((acc, r) => acc + r.value, 0);
    top.push({ name: 'Others', value: othersVal } as T);
  }
  return top;
}

export function calcKpis(days: DayMetrics[]): TelemetryStore {
  const agg: DayAggregates[] = [];
  const totals: TelemetryStore['totals'] = {
    active_users: 0,
    engaged_users: 0,
    completions_engaged_users: 0,
    chat_engaged_users: 0,
    acceptance_rate_suggestions: 0,
    acceptance_rate_lines: 0,
    chat_total: 0,
    chat_copy: 0,
    chat_insert: 0,
    dotcom_chat_engaged_users: 0,
    pr_summary_engaged_users: 0,
  };

  let sumSuggestions = 0;
  let sumAcceptances = 0;
  let sumLinesSuggested = 0;
  let sumLinesAccepted = 0;

  const ideTotals: Record<string, { engaged: number; suggestions: number; acceptances: number }> = {};
  const langTotals: Record<string, { engaged: number; suggestions: number; acceptances: number }> = {};

  let fitness_missing_cc = 0;
  let fitness_missing_chat = 0;
  // retained for possible future use; derived metric is computed later on agg

  for (const d of days) {
    let suggestions = 0;
    let acceptances = 0;
    let linesSuggested = 0;
    let linesAccepted = 0;
    let chatTotal = 0;
    let chatCopy = 0;
    let chatInsert = 0;
    const ideEngaged: Record<string, number> = {};
    const langEngaged: Record<string, number> = {};

    if (d.copilot_ide_code_completions) {
      totals.completions_engaged_users += d.copilot_ide_code_completions.total_engaged_users;
      for (const ed of (d.copilot_ide_code_completions.editors ?? [])) {
        ideEngaged[ed.name] = (ideEngaged[ed.name] ?? 0) + ed.total_engaged_users;
        ideTotals[ed.name] = ideTotals[ed.name] ?? { engaged: 0, suggestions: 0, acceptances: 0 };
        ideTotals[ed.name].engaged += ed.total_engaged_users;
        for (const m of (ed.models ?? [])) {
          for (const l of (m.languages ?? [])) {
            suggestions += l.total_code_suggestions;
            acceptances += l.total_code_acceptances;
            linesSuggested += l.total_code_lines_suggested;
            linesAccepted += l.total_code_lines_accepted;
            langEngaged[l.name] = (langEngaged[l.name] ?? 0) + l.total_engaged_users;
            langTotals[l.name] = langTotals[l.name] ?? { engaged: 0, suggestions: 0, acceptances: 0 };
            langTotals[l.name].engaged += l.total_engaged_users;
            langTotals[l.name].suggestions += l.total_code_suggestions;
            langTotals[l.name].acceptances += l.total_code_acceptances;
            ideTotals[ed.name].suggestions += l.total_code_suggestions;
            ideTotals[ed.name].acceptances += l.total_code_acceptances;
          }
        }
      }
    } else { fitness_missing_cc++; }

    if (d.copilot_ide_chat) {
      totals.chat_engaged_users += d.copilot_ide_chat.total_engaged_users;
      for (const ed of (d.copilot_ide_chat.editors ?? [])) {
        for (const m of (ed.models ?? [])) {
          chatTotal += m.total_chats;
          chatCopy += m.total_chat_copy_events;
          chatInsert += m.total_chat_insertion_events;
        }
      }
    } else { fitness_missing_chat++; }

    if (d.copilot_dotcom_chat) {
      totals.dotcom_chat_engaged_users = (totals.dotcom_chat_engaged_users ?? 0) + d.copilot_dotcom_chat.total_engaged_users;
    }
    if (d.copilot_dotcom_pull_requests) {
      totals.pr_summary_engaged_users = (totals.pr_summary_engaged_users ?? 0) + d.copilot_dotcom_pull_requests.total_engaged_users;
    }

    agg.push({
      date: d.date,
      active_users: d.total_active_users,
      engaged_users: d.total_engaged_users,
      suggestions,
      acceptances,
      lines_suggested: linesSuggested,
      lines_accepted: linesAccepted,
      chat_total: chatTotal,
      chat_copy: chatCopy,
      chat_insert: chatInsert,
      ide_engaged_by_name: ideEngaged,
      lang_engaged_by_name: langEngaged,
    });

    totals.active_users += d.total_active_users;
    totals.engaged_users += d.total_engaged_users;
    totals.chat_total += chatTotal;
    totals.chat_copy += chatCopy;
    totals.chat_insert += chatInsert;

    sumSuggestions += suggestions;
    sumAcceptances += acceptances;
    sumLinesSuggested += linesSuggested;
    sumLinesAccepted += linesAccepted;
  }

  totals.acceptance_rate_suggestions = sumSuggestions > 0 ? sumAcceptances / sumSuggestions : 0;
  totals.acceptance_rate_lines = sumLinesSuggested > 0 ? sumLinesAccepted / sumLinesSuggested : 0;
  totals.suggestions_total = sumSuggestions;
  totals.acceptances_total = sumAcceptances;
  totals.lines_suggested_total = sumLinesSuggested;
  totals.lines_accepted_total = sumLinesAccepted;
  totals.engagement_rate = totals.active_users > 0 ? totals.engaged_users / totals.active_users : 0;
  totals.mean_daily_active = days.length ? totals.active_users / days.length : 0;
  totals.mean_daily_engaged = days.length ? totals.engaged_users / days.length : 0;
  totals.suggestions_per_cc_engaged = totals.completions_engaged_users > 0 ? sumSuggestions / totals.completions_engaged_users : 0;
  totals.acceptances_per_cc_engaged = totals.completions_engaged_users > 0 ? sumAcceptances / totals.completions_engaged_users : 0;
  totals.chat_copy_rate = totals.chat_total > 0 ? totals.chat_copy / totals.chat_total : 0;
  totals.chat_insert_rate = totals.chat_total > 0 ? totals.chat_insert / totals.chat_total : 0;
  totals.chat_copy_to_insert_ratio = totals.chat_insert > 0 ? totals.chat_copy / totals.chat_insert : 0;
  totals.chats_per_chat_engaged = totals.chat_engaged_users > 0 ? totals.chat_total / totals.chat_engaged_users : 0;
  totals.chat_adoption = totals.active_users > 0 ? totals.chat_engaged_users / totals.active_users : 0;

  const byIDE = Object.entries(ideTotals).map(([name, v]) => ({
    name,
    engaged_users: v.engaged,
    acceptance_rate_suggestions: v.suggestions > 0 ? v.acceptances / v.suggestions : 0,
  }));

  const byLanguage = Object.entries(langTotals).map(([name, v]) => ({
    name,
    engaged_users: v.engaged,
    acceptance_rate_suggestions: v.suggestions > 0 ? v.acceptances / v.suggestions : 0,
  }));

  const fitness = {
    min_date: days.length ? days[0].date : null,
    max_date: days.length ? days[days.length - 1].date : null,
    num_days: days.length,
    missing_ide_completions_days: fitness_missing_cc,
    missing_ide_chat_days: fitness_missing_chat,
    acceptance_rate_over_1_days: agg.filter(a => a.suggestions > 0 && a.acceptances / a.suggestions > 1).length,
  };

  return { days: agg, totals, breakdowns: { byIDE, byLanguage }, fitness };
}
