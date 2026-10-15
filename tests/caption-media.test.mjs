import {test} from 'node:test';
import assert from 'node:assert/strict';
import {captionMediaExtension, validMediaPath, maxCaptionMediaBytes} from '../lib/caption-media.ts';
test('media accepts common images and both GIF signatures, rejecting spoofed types',()=>{
 for(const signature of ['GIF87a','GIF89a'])assert.equal(captionMediaExtension(new TextEncoder().encode(signature),'image/gif'),'gif');
 assert.equal(captionMediaExtension(new Uint8Array([255,216,255]),'image/jpeg'),'jpg');
 assert.equal(captionMediaExtension(new Uint8Array([137,80,78,71,13,10,26,10]),'image/png'),'png');
 for(const type of ['image/gif','image/jpeg','image/png','image/webp','image/svg+xml'])assert.equal(captionMediaExtension(new TextEncoder().encode('<svg onload="alert(1)">'),type),null);
 assert.equal(captionMediaExtension(new TextEncoder().encode('GIF89a'),'image/png'),null);
 assert.equal(maxCaptionMediaBytes,3145728);
});
test('public media URLs can only be built from expected storage object paths',()=>{
 assert.ok(validMediaPath('550e8400-e29b-41d4-a716-446655440000/550e8400-e29b-41d4-a716-446655440001.gif'));
 for(const path of ['https://evil.test/a.gif','../file.gif','user/file.svg',null,'550e8400-e29b-41d4-a716-446655440000/../../file.gif'])assert.equal(validMediaPath(path),false);
});
