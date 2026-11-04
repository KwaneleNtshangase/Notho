import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readGeminiStream } from './gemini-stream.mjs';

function fragmented(source) {
  const bytes = new TextEncoder().encode(source);
  return new Response(new ReadableStream({ start(controller) {
    for (let i = 0; i < bytes.length; i++) controller.enqueue(bytes.slice(i, i + 1));
    controller.close();
  } }));
}
test('reassembles fragmented UTF-8, ignores thoughts and keeps final usage', async () => {
  const events = [
    { candidates: [{ content: { parts: [{ thought: true, text: 'internal' }, { text: 'Ṅwedzi ' }] } }] },
    { candidates: [{ content: { parts: [{ text: 'muṅwe' }] }, finishReason: 'STOP' }], usageMetadata: { totalTokenCount: 10 } },
  ];
  const result = await readGeminiStream(fragmented(': comment\r\n\r\n' + events.map(event => `data: ${JSON.stringify(event)}\r\n\r\n`).join('')));
  assert.equal(result.candidates[0].content.parts[0].text, 'Ṅwedzi muṅwe');
  assert.equal(result.candidates[0].finishReason, 'STOP');
  assert.equal(result.usageMetadata.totalTokenCount, 10);
});
test('rejects incomplete and failed streams instead of accepting their text', async () => {
  await assert.rejects(readGeminiStream(fragmented('data: {"candidates":[{"content":{"parts":[{"text":"partial"}]}}]}\n\n')), /Incomplete/);
  await assert.rejects(readGeminiStream(fragmented('data: {"error":{"code":503}}\n\n')), /503/);
});
