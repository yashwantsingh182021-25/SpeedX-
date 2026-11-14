// Optional AI engine (Claude). Uses the user's own API key, stored only on their device.
import Anthropic from '@anthropic-ai/sdk';
import { CATEGORIES, scoreFromChanges, countByType } from './engine.js';

const MODEL = 'claude-opus-5-5';

const SYSTEM_PROMPT = `You are SpeedX, an English coach inside a chat app used by Indian users.
The user types a chat message in Hinglish (Hindi written in Roman letters mixed with English), chat short-forms, or imperfect English.
Rewrite it as natural, correct English that keeps the user's meaning, tone and emojis.
- "friendly" tone: natural, relaxed English suitable for friends and family (contractions are fine).
- "formal" tone: polite, professional English suitable for teachers, clients or work.
Never add new information, greetings or sign-offs. Keep names, numbers and emojis exactly.
If the message is already correct, return it unchanged with an empty changes list.
List each individual correction so the user can learn from it. Use these types:
hinglish (Hindi word or Hindi word order translated), spelling, slang (chat short-forms like u, r, pls),
grammar (agreement, tense, articles, word order), missing_verb (missing am/is/are/do etc.),
capitalization, punctuation.
"from" is the original fragment, "to" is the corrected fragment, "note" is one short, simple explanation (max 15 words) that a learner can understand.`;

const SCHEMA = {
  type: 'object',
  properties: {
    corrected: { type: 'string' },
    changes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          type: { type: 'string', enum: Object.keys(CATEGORIES) },
          note: { type: 'string' },
        },
        required: ['from', 'to', 'type', 'note'],
        additionalProperties: false,
      },
    },
  },
  required: ['corrected', 'changes'],
  additionalProperties: false,
};

export class AIError extends Error {}

export async function convertWithAI(text, { apiKey, tone = 'friendly' }) {
  if (!apiKey) throw new AIError('Add your Claude API key in Settings to use AI mode.');

  // The key belongs to the user and never leaves their device except to call the API.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1, timeout: 60_000 });

  let response;
  try {
    response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Tone: ${tone}\nMessage:\n${text}` }],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new AIError('Your Claude API key was rejected. Check it in Settings.');
    if (err instanceof Anthropic.RateLimitError) throw new AIError('Too many requests right now. Wait a moment and try again.');
    if (err instanceof Anthropic.APIConnectionError) throw new AIError('No internet connection. Using the offline engine instead.');
    if (err instanceof Anthropic.APIError) throw new AIError(`Claude API error (${err.status ?? 'unknown'}). Using the offline engine instead.`);
    throw err;
  }

  if (response.stop_reason === 'refusal') throw new AIError('The AI could not rewrite this message. Using the offline engine instead.');
  if (response.stop_reason === 'max_tokens') throw new AIError('The message is too long for AI mode.');

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new AIError('Empty response from the AI.');
  let data;
  try {
    data = JSON.parse(textBlock.text);
  } catch {
    throw new AIError('Could not read the AI response.');
  }

  const changes = (data.changes || []).filter((c) => CATEGORIES[c.type]);
  return {
    output: data.corrected,
    changes,
    stats: {
      counts: countByType(changes),
      before: scoreFromChanges(text, changes),
      after: 100,
    },
    lowConfidence: false,
  };
}
