import { MatchType } from '@prisma/client';

export type RuleInput = {
  id: string;
  priority: number;
  matchType: MatchType;
  pattern: string;
  assignsCategoryId?: string | null;
  assignsAccountId?: string | null;
};

export function applyRules(
  description: string,
  merchant: string,
  rules: RuleInput[]
): RuleInput | null {
  const text = `${merchant} ${description}`.trim().toLowerCase();
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);
  for (const rule of sorted) {
    const pattern = rule.pattern.toLowerCase();
    switch (rule.matchType) {
      case MatchType.CONTAINS:
        if (text.includes(pattern)) return rule;
        break;
      case MatchType.STARTS_WITH:
        if (text.startsWith(pattern)) return rule;
        break;
      case MatchType.ENDS_WITH:
        if (text.endsWith(pattern)) return rule;
        break;
      case MatchType.REGEX: {
        try {
          const regex = new RegExp(rule.pattern, 'i');
          if (regex.test(text)) return rule;
        } catch {
          continue;
        }
        break;
      }
      default:
        break;
    }
  }
  return null;
}
