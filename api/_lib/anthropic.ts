import { env, MODEL } from './env';

// Direct call to the Anthropic Messages API over fetch — no SDK. The official
// SDK pulls in node:fs/node:path (OAuth credential files) which the Vercel Edge
// runtime can't bundle, so we hit the REST endpoint the edge runtime supports
// natively. The returned shape matches what callers read: content[] + usage.
const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

export interface MessagesResponse {
  content: { type: string; text?: string }[];
  usage: { input_tokens: number; output_tokens: number };
}

export async function createMessage(opts: {
  max_tokens: number;
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  model?: string;
}): Promise<MessagesResponse> {
  const apiKey = env('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('missing ANTHROPIC_API_KEY');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION,
    },
    body: JSON.stringify({
      model: opts.model ?? MODEL(),
      max_tokens: opts.max_tokens,
      ...(opts.system ? { system: opts.system } : {}),
      messages: opts.messages,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`anthropic ${res.status}: ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as MessagesResponse;
}
