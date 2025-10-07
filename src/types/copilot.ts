export type LanguageStats = {
  name: string;
  total_engaged_users: number;
  total_code_suggestions: number;
  total_code_acceptances: number;
  total_code_lines_suggested: number;
  total_code_lines_accepted: number;
};

export type CompletionModel = {
  name: string;
  is_custom_model?: boolean;
  custom_model_training_date?: string | null;
  total_engaged_users: number;
  languages: LanguageStats[];
};

export type EditorCompletions = {
  name: string; // vscode, neovim, jetbrains
  total_engaged_users: number;
  models: CompletionModel[];
};

export type IDECodeCompletions = {
  total_engaged_users: number;
  languages?: { name: string; total_engaged_users: number }[];
  editors: EditorCompletions[];
};

export type ChatModel = {
  name: string;
  is_custom_model?: boolean;
  total_engaged_users: number;
  total_chats: number;
  total_chat_insertion_events: number;
  total_chat_copy_events: number;
};

export type EditorChat = {
  name: string;
  total_engaged_users: number;
  models: ChatModel[];
};

export type IDEChat = {
  total_engaged_users: number;
  editors: EditorChat[];
};

export type DotcomChat = { total_engaged_users: number };

export type RepoModels = { name: string; total_pr_summaries_created: number; total_engaged_users: number }[];

export type RepoEntry = {
  name: string; // org/repo
  total_engaged_users: number;
  models?: RepoModels;
};

export type DotcomPullRequests = {
  total_engaged_users: number;
  repositories?: RepoEntry[];
};

export type DayMetrics = {
  date: string; // YYYY-MM-DD
  total_active_users: number;
  total_engaged_users: number;
  copilot_ide_code_completions?: IDECodeCompletions;
  copilot_ide_chat?: IDEChat;
  copilot_dotcom_chat?: DotcomChat;
  copilot_dotcom_pull_requests?: DotcomPullRequests;
};

export type Period = 7 | 28 | 90 | 100;

export type DayAggregates = {
  date: string;
  active_users: number;
  engaged_users: number;
  suggestions: number;
  acceptances: number;
  lines_suggested: number;
  lines_accepted: number;
  chat_total: number;
  chat_copy: number;
  chat_insert: number;
  ide_engaged_by_name: Record<string, number>;
  lang_engaged_by_name: Record<string, number>;
};

export type TelemetryStore = {
  days: DayAggregates[];
  totals: {
    active_users: number;
    engaged_users: number;
    completions_engaged_users: number;
    chat_engaged_users: number;
    dotcom_chat_engaged_users?: number;
    pr_summary_engaged_users?: number;
    acceptance_rate_suggestions: number;
    acceptance_rate_lines: number;
    chat_total: number;
    chat_copy: number;
    chat_insert: number;
    engagement_rate?: number; // engaged / active
    mean_daily_active?: number;
    mean_daily_engaged?: number;
    suggestions_total?: number;
    acceptances_total?: number;
    lines_suggested_total?: number;
    lines_accepted_total?: number;
    suggestions_per_cc_engaged?: number;
    acceptances_per_cc_engaged?: number;
    chat_copy_rate?: number;
    chat_insert_rate?: number;
    chat_copy_to_insert_ratio?: number;
    chats_per_chat_engaged?: number;
    chat_adoption?: number; // chat engaged / active
    custom_model_share?: number; // custom engaged / all cc engaged
  };
  breakdowns: {
    byIDE: { name: string; engaged_users: number; acceptance_rate_suggestions: number }[];
    byLanguage: { name: string; engaged_users: number; acceptance_rate_suggestions: number }[];
    byModel?: { name: string; engaged_users: number; acceptance_rate_suggestions: number; is_custom?: boolean }[];
  };
  fitness?: {
    min_date: string | null;
    max_date: string | null;
    num_days: number;
    missing_ide_completions_days: number;
    missing_ide_chat_days: number;
    acceptance_rate_over_1_days: number;
  };
};
