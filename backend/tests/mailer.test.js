import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../utils/mailer.js';

describe('escapeHtml', () => {
  it('turns markup in user input into plain text', () => {
    assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    assert.equal(escapeHtml("Tom & Jerry's"), 'Tom &amp; Jerry&#39;s');
  });

  it('handles missing values', () => {
    assert.equal(escapeHtml(undefined), '');
  });
});
