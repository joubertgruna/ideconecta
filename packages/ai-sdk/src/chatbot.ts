import { streamText } from 'ai';
import { getOpenAIProvider, MODELS } from './providers.js';
import { CHATBOT_SYSTEM_PROMPT } from './prompts/chatbot.js';
import type { ChatMessage } from '@ideconecta/types';

export async function streamChat(
  messages: ChatMessage[],
  systemPrompt?: string,
  apiKey?: string
) {
  const openai = getOpenAIProvider(apiKey);

  return streamText({
    model: openai(MODELS.chatAdvanced),
    system: systemPrompt ?? CHATBOT_SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    temperature: 0.8,
    maxTokens: 1024,
  });
}
