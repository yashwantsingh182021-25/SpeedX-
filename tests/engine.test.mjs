import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert, diffWords } from '../src/engine.js';

const cases = [
  ['main ghar ja raha hoon', 'I am going home.'],
  ['tum kya kar rahe ho', 'What are you doing?'],
  ['kya haal hai bhai', 'How are you bro?'],
  ['mujhe nahi pata yaar', "I don't know."],
  ['u r coming tmrw?', 'You are coming tomorrow?'],
  ['i going to market', 'I am going to market.'],
  ['he dont know', "He doesn't know."],
  ['she go to college daily', 'She goes to college daily.'],
  ['i am agree with u', 'I agree with you.'],
  ['what you are doing', 'What are you doing?'],
  ['you free?', 'Are you free?'],
  ['main busy hoon', 'I am busy.'],
  ['tum free ho?', 'Are you free?'],
  ['i ate a apple', 'I ate an apple.'],
  ['The main reason is simple', 'The main reason is simple.'],
  ['thanks a lot!!!', 'Thanks a lot!'],
  ['I did not went there becoz of rain', 'I did not go there because of rain.'],
  ['kal milte hain', 'See you tomorrow.'],
  ['mujhe paani chahiye', 'I need water.'],
  ['ok see you 😀', 'Ok see you 😀'],
];

for (const [input, expected] of cases) {
  test(input, () => {
    const r = convert(input);
    assert.equal(r.output, expected);
  });
}

test('stats before < after for messy text', () => {
  const r = convert('i going ghar becoz u r late');
  assert.ok(r.stats.before < r.stats.after, JSON.stringify(r.stats));
  assert.ok(r.changes.length > 0);
});

test('diff marks changes', () => {
  const d = diffWords('i going home', 'I am going home.');
  assert.ok(d.some((p) => p.type === 'add'));
});

test('filler removed in mixed sentence', () => {
  assert.equal(convert('yaar main ghar ja raha hoon, tum free ho?').output, 'I am going home, are you free?');
});
