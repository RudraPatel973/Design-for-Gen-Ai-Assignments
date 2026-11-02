import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSuggestion, parseScreening } from '../lib/caption-validation.ts';
import { utcDay, validDay } from '../lib/daily-prompt.ts';

test('suggestions need 10–200 characters and a known category', () => {
  assert.deepEqual(validateSuggestion('  First cold   morning on College Walk ', 'Campus'), { topic: 'First cold morning on College Walk', category: 'Campus' });
  for (const [topic, category] of [['too short', 'Campus'], ['x'.repeat(201), 'Campus'], ['A perfectly fine moment', 'Gossip'], [null, 'Campus'], ['A perfectly fine moment', null]]) assert.equal(validateSuggestion(topic, category), null);
});
test('screening responses must be a strict boolean', () => {
  assert.equal(parseScreening('{"allowed":true}'), true);
  assert.equal(parseScreening('{"allowed":false}'), false);
  for (const text of ['{"allowed":"yes"}', '{}', 'null']) assert.throws(() => parseScreening(text));
});
test('prompt days are real UTC calendar dates', () => {
  assert.equal(utcDay(new Date('2026-10-15T23:59:59Z')), '2026-10-15');
  assert.equal(utcDay(new Date('2026-10-16T00:00:00Z')), '2026-10-16');
  assert.equal(validDay('2026-10-15'), '2026-10-15');
  for (const value of ['2026-02-30', '2026-13-01', '15-10-2026', "2026-10-15' or 1=1", '', null, undefined]) assert.equal(validDay(value), null);
});

import { fillTemplate, pickWeighted } from '../lib/chain-template.ts';
test('chain templates fill known placeholders and keep unknown ones visible', () => {
  assert.equal(fillTemplate('Moment: {{moment}} / {{ tone }} / {{oops}}', { moment: '"x"', tone: 'Dry wit' }), 'Moment: "x" / Dry wit / {{oops}}');
  assert.equal(fillTemplate('{{previous_output}}{{previous_output}}', { previous_output: 'a$1' }), 'a$1a$1');
});
test('surprise tone respects mix weights', () => {
  const options = [{ value: 'A', weight: 40 }, { value: 'B', weight: 0 }, { value: 'C', weight: 60 }];
  assert.equal(pickWeighted(options, 0), 'A');
  assert.equal(pickWeighted(options, 0.39), 'A');
  assert.equal(pickWeighted(options, 0.41), 'C');
  assert.equal(pickWeighted(options, 0.999), 'C');
  assert.equal(pickWeighted([{ value: 'A', weight: 0 }], 0.5), null);
});
