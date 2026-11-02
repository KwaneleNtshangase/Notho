import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { translateMockPresentation } from '@/server/localizeMock';

describe('secured exam translation', () => {
  it('translates the redacted presentation without adding answers or changing identifiers', () => {
    const response = { questionId: 'A', prompt: 'Choose an answer', options: [{ id: 'A', label: 'A', text: 'Save first' }], remainingSeconds: 60 };
    const translated = translateMockPresentation(response, { 'Choose an answer': 'Kies ’n antwoord', 'Save first': 'Spaar eers', A: 'B' }, '', 'af');
    expect(translated).toEqual({ questionId: 'A', prompt: 'Kies ’n antwoord', options: [{ id: 'A', label: 'A', text: 'Spaar eers' }], remainingSeconds: 60 });
    expect(translated).not.toHaveProperty('correctOptionId');
    expect(response.prompt).toBe('Choose an answer');
  });
  it('falls back when a translated explanation changes a consequential number', () => {
    expect(translateMockPresentation({ explanation: 'Wait 30 days' }, { 'Wait 30 days': 'Wag 3 dae' }, '', 'af')).toEqual({ explanation: 'Wait 30 days' });
  });
});
