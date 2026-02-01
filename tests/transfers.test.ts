import { describe, expect, it } from 'vitest';
import { detectTransfers } from '../lib/import/parsing';

describe('detectTransfers', () => {
  it('matches opposite transactions across accounts within window', () => {
    const transactions = [
      { id: 'a', date: new Date('2024-05-01'), amount: -50, accountId: 'one' },
      { id: 'b', date: new Date('2024-05-03'), amount: 50, accountId: 'two' },
      { id: 'c', date: new Date('2024-05-10'), amount: 25, accountId: 'two' }
    ];

    const pairs = detectTransfers(transactions, 3);
    expect(pairs).toEqual([['a', 'b']]);
  });
});
