import { describe, expect, it } from 'vitest';
import { parseAmount, parseExcelDate } from '../lib/import/parsing';

describe('parseExcelDate', () => {
  it('parses excel serial dates', () => {
    const date = parseExcelDate(45123);
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2023);
  });

  it('parses date strings', () => {
    const date = parseExcelDate('2024-05-01');
    expect(date?.toISOString().slice(0, 10)).toBe('2024-05-01');
  });
});

describe('parseAmount', () => {
  it('parses comma values', () => {
    expect(parseAmount('1,234.56')).toBeCloseTo(1234.56, 2);
  });

  it('handles negative values', () => {
    expect(parseAmount('-42.10')).toBeCloseTo(-42.1, 2);
  });
});
