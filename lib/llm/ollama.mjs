// Ollama Provider — OpenAI-compatible endpoint, no auth required

import { LLMProvider } from './provider.mjs';

export class OllamaProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.name = 'ollama';
    this.host = config.host || 'http://localhost:11434';
    this.model = config.model || 'llama3';
  }

  get isConfigured() { return true; }

  async complete(systemPrompt, userMessage, opts = {}) {
    const url = `${this.host.replace(/\/+$/, '')}/v1/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        max_completion_tokens: opts.maxTokens || 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
      signal: AbortSignal.timeout(opts.timeout || 60000),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Ollama API ${res.status}: ${err.substring(0, 200)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
      model: data.model || this.model,
    };
  }
}
