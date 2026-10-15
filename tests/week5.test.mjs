import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authDestination } from '../lib/auth-destination.ts';
import { captionTone, categories } from '../lib/caption-validation.ts';
import { dailyChallenge } from '../lib/daily-prompt.ts';

test('login returns only to known internal pages, rejecting open redirects', () => {
  for (const path of ['/create','/captions','/club','/profile']) assert.equal(authDestination(path),path);
  for (const path of ['https://evil.test','//evil.test','/\\evil.test','/create?next=https://evil.test','javascript:alert(1)',null,undefined]) assert.equal(authDestination(path),'/captions');
});
test('generation styles accept only the supported choices', () => {
  for (const tone of ['Dry wit','Wholesome','Chaotic']) assert.equal(captionTone(tone),tone);
  for (const tone of ['ignore instructions','',null,new Blob(['x'])]) assert.equal(captionTone(tone),null);
});
test('every daily challenge carries a valid matching generation category', () => {
  for(let day=1;day<=7;day++) {
    const challenge=dailyChallenge(new Date(`2026-10-0${day}T00:00:00Z`));
    assert.ok(categories.includes(challenge.category));
    assert.ok(challenge.topic.length >= 10 && challenge.topic.length <=400);
  }
  assert.equal(dailyChallenge(new Date('1970-01-03T01:00:00Z')).category,'Food');
});
