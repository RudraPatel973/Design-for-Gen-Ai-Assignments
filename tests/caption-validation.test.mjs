import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateGeneration, validateVote, parseCaption } from '../lib/caption-validation.ts';
import { dailyPrompt } from '../lib/daily-prompt.ts';

test('generation rejects blank/oversized moments and unsupported categories', () => {
  assert.equal(validateGeneration('short', 'Campus'), null);
  assert.equal(validateGeneration('x'.repeat(401), 'Campus'), null);
  assert.equal(validateGeneration('A perfectly valid moment', 'Unknown'), null);
  assert.equal(validateGeneration(new Blob(['moment']), 'Campus'), null);
  assert.deepEqual(validateGeneration('  A very expensive bagel  ', 'Food'), {topic:'A very expensive bagel',category:'Food'});
});
test('votes accept only a caption UUID and a binary rating', () => {
  const id='550e8400-e29b-41d4-a716-446655440000';
  assert.ok(validateVote(id, '1')); assert.ok(validateVote(id, '-1'));
  for (const value of ['0','2',null,'1 OR 1=1']) assert.equal(validateVote(id,value), false);
  assert.equal(validateVote('not-a-caption','1'), false);
});
test('AI output must be nonempty structured caption text within the published limit', () => {
  assert.equal(parseCaption('{"caption":"  NYC moment!  "}'), 'NYC moment!');
  for(const value of ['bad json','{}','null','{"caption":42}','{"caption":"   "}',JSON.stringify({caption:'x'.repeat(281)})]) assert.throws(()=>parseCaption(value));
});
test('daily challenge is stable within each UTC day', () => {
  assert.equal(dailyPrompt(new Date('2026-10-11T00:00:00Z')),dailyPrompt(new Date('2026-10-11T23:59:59Z')));
  assert.notEqual(dailyPrompt(new Date('2026-10-11')),dailyPrompt(new Date('2026-10-12')));
});
