import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { imageType } from '../controllers/authController.js';

describe('profile photos', () => {
  it('are taken by what the bytes are, not what they claim', () => {
    assert.equal(imageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10])), 'image/jpeg');
    assert.equal(imageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), 'image/png');
    assert.equal(imageType(Buffer.from('<svg onload="alert(1)">')), null);
    assert.equal(imageType(Buffer.alloc(0)), null);
  });
});
