/** Reassemble the documented Gemini SSE protocol without accepting a partial
 * translation response. Only completed output reaches the row validator. */
export async function readGeminiStream(response) {
  if (!response.body) throw new Error('Missing translation response stream');
  const decoder = new TextDecoder();
  const text = [];
  let pending = '', data = [], finishReason, usageMetadata;
  function dispatch() {
    if (!data.length) return;
    const raw = data.join('\n'); data = [];
    if (raw === '[DONE]') return;
    const chunk = JSON.parse(raw);
    if (chunk.error) throw new Error(`Translation stream error (${chunk.error.code ?? 'unknown'})`);
    const candidate = chunk.candidates?.find(candidate => !candidate.index) ?? chunk.candidates?.[0];
    for (const part of candidate?.content?.parts ?? []) if (!part.thought && typeof part.text === 'string') text.push(part.text);
    if (candidate?.finishReason) finishReason = candidate.finishReason;
    if (chunk.usageMetadata) usageMetadata = chunk.usageMetadata;
  }
  function line(raw) {
    const value = raw.replace(/\r$/, '');
    if (!value) dispatch();
    else if (value.startsWith('data:')) data.push(value.slice(5).replace(/^ /, ''));
  }
  for await (const bytes of response.body) {
    pending += decoder.decode(bytes, { stream: true });
    let end;
    while ((end = pending.indexOf('\n')) >= 0) {
      line(pending.slice(0, end)); pending = pending.slice(end + 1);
    }
  }
  pending += decoder.decode();
  if (pending) line(pending);
  dispatch();
  if (!finishReason) throw new Error('Incomplete translation response stream');
  return { candidates: [{ content: { parts: [{ text: text.join('') }] }, finishReason }], usageMetadata };
}
