// LLM Factory — creates the configured provider or returns null

import { AnthropicProvider } from './anthropic.mjs';
import { OpenAIProvider } from './openai.mjs';
import { GeminiProvider } from './gemini.mjs';
import { CodexProvider } from './codex.mjs';
import { OllamaProvider } from './ollama.mjs';
import { OpenRouterProvider } from './openrouter.mjs';

export { LLMProvider } from './provider.mjs';
export { AnthropicProvider } from './anthropic.mjs';
export { OpenAIProvider } from './openai.mjs';
export { GeminiProvider } from './gemini.mjs';
export { CodexProvider } from './codex.mjs';
export { OllamaProvider } from './ollama.mjs';
export { OpenRouterProvider } from './openrouter.mjs';

/**
 * Create an LLM provider based on config.
 * @param {{ provider: string|null, apiKey: string|null, model: string|null }} llmConfig
 * @returns {LLMProvider|null}
 */
export function createLLMProvider(llmConfig) {
  if (!llmConfig?.provider) return null;

  const { provider, apiKey, model } = llmConfig;

  switch (provider.toLowerCase()) {
    case 'anthropic':
      return new AnthropicProvider({ apiKey, model });
    case 'openai':
      return new OpenAIProvider({ apiKey, model });
    case 'gemini':
      return new GeminiProvider({ apiKey, model });
    case 'codex':
      return new CodexProvider({ model });
    case 'ollama':
      return new OllamaProvider({ host: llmConfig.ollamaHost, model });
    case 'openrouter':
      return new OpenRouterProvider({ apiKey, model });
    default:
      console.warn(`[LLM] Unknown provider "${provider}". LLM features disabled.`);
      return null;
  }
}
