import { test } from 'node:test';
import assert from 'node:assert/strict';
import { googleProfile, googlePhotoUrl } from '../lib/google-profile.ts';
test('imports explicit Google names and picture', () => {
 assert.deepEqual(googleProfile({given_name:' Sam ',family_name:'Rivera',full_name:'Other Name',picture:'https://lh3.googleusercontent.com/avatar'}),{first_name:'Sam',last_name:'Rivera',photo:'https://lh3.googleusercontent.com/avatar'});
});
test('uses full name when separate fields are absent, preserving multiword surnames', () => {
 assert.equal(googleProfile({full_name:'Sam van Dyke'}).last_name,'van Dyke');
 assert.equal(googleProfile({name:'Prince'}).last_name,null);
 assert.equal(googleProfile({}).first_name,null);
 assert.equal(googleProfile({given_name:'x'.repeat(81)}).first_name,null);
});
test('rejects arbitrary photo hosts and insecure or disguised Google URLs', () => {
 for(const url of ['http://lh3.googleusercontent.com/a','https://googleusercontent.com.evil.test/a','https://evil.test/a','https://user:password@lh3.googleusercontent.com/a','javascript:alert(1)']) assert.equal(googlePhotoUrl(url),undefined);
 assert.ok(googlePhotoUrl('https://lh3.googleusercontent.com/a'));
});
