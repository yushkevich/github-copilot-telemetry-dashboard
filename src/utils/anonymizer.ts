import { DayMetrics } from '@/src/types/copilot';
import { hash8 } from './crypto';

type Options = { salt: string };

function cloneKnown<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function anonymizeDay(day: DayMetrics, opts: Options): DayMetrics {
  const salt = opts.salt;
  const out: DayMetrics = {
    date: day.date,
    total_active_users: day.total_active_users,
    total_engaged_users: day.total_engaged_users,
  };

  if (day.copilot_ide_code_completions) {
    out.copilot_ide_code_completions = {
      total_engaged_users: day.copilot_ide_code_completions.total_engaged_users,
      languages: day.copilot_ide_code_completions.languages
        ? day.copilot_ide_code_completions.languages.map(l => ({ name: l.name, total_engaged_users: l.total_engaged_users }))
        : undefined,
      editors: (day.copilot_ide_code_completions.editors ?? []).map(ed => ({
        name: ed.name,
        total_engaged_users: ed.total_engaged_users,
        models: (ed.models ?? []).map(m => ({
          name: m.is_custom_model ? `model-${hash8(salt, m.name)}` : m.name,
          is_custom_model: m.is_custom_model,
          custom_model_training_date: m.is_custom_model ? undefined : m.custom_model_training_date,
          total_engaged_users: m.total_engaged_users,
          languages: (m.languages ?? []).map(ls => cloneKnown(ls)),
        })),
      })),
    };
  }

  if (day.copilot_ide_chat) {
    out.copilot_ide_chat = {
      total_engaged_users: day.copilot_ide_chat.total_engaged_users,
      editors: (day.copilot_ide_chat.editors ?? []).map(ed => ({
        name: ed.name,
        total_engaged_users: ed.total_engaged_users,
        models: (ed.models ?? []).map(m => ({
          name: m.is_custom_model ? `model-${hash8(salt, m.name)}` : m.name,
          is_custom_model: m.is_custom_model,
          total_engaged_users: m.total_engaged_users,
          total_chats: m.total_chats,
          total_chat_insertion_events: m.total_chat_insertion_events,
          total_chat_copy_events: m.total_chat_copy_events,
        })),
      })),
    };
  }

  if (day.copilot_dotcom_chat) {
    out.copilot_dotcom_chat = { total_engaged_users: day.copilot_dotcom_chat.total_engaged_users };
  }

  if (day.copilot_dotcom_pull_requests) {
    out.copilot_dotcom_pull_requests = {
      total_engaged_users: day.copilot_dotcom_pull_requests.total_engaged_users,
      repositories: (day.copilot_dotcom_pull_requests.repositories ?? []).map(r => ({
        name: `repo-${hash8(salt, r.name)}`,
        total_engaged_users: r.total_engaged_users,
        models: (r.models ?? []).map(mm => ({
          name: mm.name,
          total_pr_summaries_created: mm.total_pr_summaries_created,
          total_engaged_users: mm.total_engaged_users,
        })),
      })),
    };
  }

  return out;
}
