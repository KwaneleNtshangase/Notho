import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/supabaseClient', () => ({ supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'test-token' } } }) } } }));
import { getMockExplanation, saveMockAttemptMutation } from '../client';

afterEach(() => vi.unstubAllGlobals());
describe('mock exam language changes in flight', () => {
  it('re-reads the same attempt in English without replaying the answer', async () => {
    const document = { documentElement: { lang: 'af-ZA' } };
    vi.stubGlobal('document', document);
    const fetch = vi.fn().mockImplementationOnce(async () => {
      document.documentElement.lang = 'en-ZA';
      return Response.json({ attempt: { id: 'attempt-1', stateVersion: 2, questions: [{ prompt: 'Kies' }] } });
    }).mockResolvedValueOnce(Response.json({ attempt: { id: 'attempt-1', stateVersion: 2, questions: [{ prompt: 'Choose' }] } }));
    vi.stubGlobal('fetch', fetch);
    const result = await saveMockAttemptMutation('attempt-1', { action: 'view', mutationId: 'mutation-1', questionIndex: 0 });
    expect(result.questions[0].prompt).toBe('Choose');
    expect(fetch.mock.calls.map(call => call[1].method)).toEqual(['PATCH', 'GET']);
    expect(fetch.mock.calls.map(call => call[1].headers['X-Notho-Locale'])).toEqual(['af', 'en']);
    expect(fetch.mock.calls[1][0]).toBe('/api/mock-attempts/attempt-1');
  });
  it('does not display an explanation returned in the previous language', async () => {
    const document = { documentElement: { lang: 'af-ZA' } };
    vi.stubGlobal('document', document);
    const fetch = vi.fn().mockImplementationOnce(async () => {
      document.documentElement.lang = 'en-ZA';
      return Response.json({ explanation: 'Spaar eers' });
    }).mockResolvedValueOnce(Response.json({ explanation: 'Save first' }));
    vi.stubGlobal('fetch', fetch);
    expect(await getMockExplanation('attempt-1', 'question-1')).toBe('Save first');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
