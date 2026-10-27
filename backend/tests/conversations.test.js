import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeConversationMessage } from '../controllers/chatController.js';

describe('sanitizeConversationMessage', () => {
  it('keeps role, content, follow-ups and time', () => {
    const m = sanitizeConversationMessage({ type: 'assistant', content: ' Hi ', suggestions: ['Make it shorter', '', 7], createdAt: '2026-10-26T08:00:00Z' });
    assert.deepEqual(m, { role: 'assistant', content: 'Hi', suggestions: ['Make it shorter'], createdAt: new Date('2026-10-26T08:00:00Z') });
  });

  it('drops messages without a known role or content', () => {
    assert.equal(sanitizeConversationMessage({ role: 'system', content: 'x' }), null);
    assert.equal(sanitizeConversationMessage({ role: 'user', content: '   ' }), null);
  });

  it('caps long content and missing times', () => {
    const m = sanitizeConversationMessage({ role: 'user', content: 'x'.repeat(5000), createdAt: 'nope' });
    assert.equal(m.content.length, 4000);
    assert.ok(m.createdAt instanceof Date);
  });
});
