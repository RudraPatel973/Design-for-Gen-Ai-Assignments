import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateNames, imageExtension } from '../lib/profile-validation.ts';

test('names require both values and reject oversized or non-string input', () => {
  for (const [first, last] of [[' ', 'Patel'], ['Rudra', ''], ['a'.repeat(81), 'Patel'], [null, 'Patel'], ['Rudra', new Blob(['x'])]]) {
    assert.equal(validateNames(first, last), null);
  }
  assert.deepEqual(validateNames('  Rudra ', ' પટેલ '), {first_name:'Rudra', last_name:'પટેલ'});
});

test('photo validation rejects SVGs and files whose contents disagree with their MIME type', () => {
  const svg = new TextEncoder().encode('<svg onload="alert(1)"></svg>');
  assert.equal(imageExtension(svg, 'image/png'), null);
  assert.equal(imageExtension(svg, 'image/svg+xml'), null);
  const png = new Uint8Array([137,80,78,71,13,10,26,10]);
  assert.equal(imageExtension(png, 'image/png'), 'png');
  assert.equal(imageExtension(png, 'image/jpeg'), null);
  assert.equal(imageExtension(new Uint8Array([255,216,255]), 'image/jpeg'), 'jpg');
  assert.equal(imageExtension(new TextEncoder().encode('RIFF0000WEBP'), 'image/webp'), 'webp');
  assert.equal(imageExtension(new Uint8Array(), 'image/png'), null);
});
