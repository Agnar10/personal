import { describe, expect, it } from 'vitest';
import { applyRules } from '../lib/categorization';
import { MatchType } from '@prisma/client';

describe('applyRules', () => {
  it('matches in priority order', () => {
    const rules = [
      {
        id: '1',
        priority: 2,
        matchType: MatchType.CONTAINS,
        pattern: 'coffee',
        assignsCategoryId: 'cat-coffee'
      },
      {
        id: '2',
        priority: 1,
        matchType: MatchType.CONTAINS,
        pattern: 'market',
        assignsCategoryId: 'cat-grocery'
      }
    ];

    const rule = applyRules('Whole Foods Market', '', rules);
    expect(rule?.assignsCategoryId).toBe('cat-grocery');
  });
});
