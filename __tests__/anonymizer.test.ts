import { anonymizeDay } from '@/src/utils/anonymizer';
import { hash8 } from '@/src/utils/crypto';
import { DayMetrics } from '@/src/types/copilot';

test('anonymizeDay hashes repo names and custom models deterministically', () => {
  const salt = 'somesalt';
  const day: DayMetrics = {
    date: '2025-01-01',
    total_active_users: 1,
    total_engaged_users: 1,
    copilot_dotcom_pull_requests: {
      total_engaged_users: 1,
      repositories: [
        { name: 'org1/repoA', total_engaged_users: 1 },
        { name: 'org2/repoB', total_engaged_users: 1 },
      ],
    },
    copilot_ide_code_completions: {
      total_engaged_users: 1,
      editors: [
        {
          name: 'vscode',
          total_engaged_users: 1,
          models: [
            {
              name: 'my-custom',
              is_custom_model: true,
              total_engaged_users: 1,
              languages: [
                { name: 'typescript', total_engaged_users: 1, total_code_suggestions: 10, total_code_acceptances: 6, total_code_lines_suggested: 100, total_code_lines_accepted: 60 },
              ],
            },
          ],
        },
      ],
    },
  };

  const out = anonymizeDay(day, { salt });
  const repoHashA = hash8(salt, 'org1/repoA');
  const repoHashB = hash8(salt, 'org2/repoB');
  expect(out.copilot_dotcom_pull_requests?.repositories?.[0].name).toBe(`repo-${repoHashA}`);
  expect(out.copilot_dotcom_pull_requests?.repositories?.[1].name).toBe(`repo-${repoHashB}`);
  const modelName = out.copilot_ide_code_completions?.editors[0].models[0].name as string;
  expect(modelName.startsWith('model-')).toBe(true);
});
