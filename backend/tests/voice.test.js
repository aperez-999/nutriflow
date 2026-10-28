import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { humanize, VOICE_RULES } from '../ai/prompts/voice.js';
import { COACH_SYSTEM_PROMPT } from '../ai/prompts/coachPrompt.js';

describe('coach voice', () => {
  it('turns em dashes into commas', () => {
    assert.equal(humanize('Rest today — your legs are still sore.'), 'Rest today, your legs are still sore.');
    assert.equal(humanize('Eat first—then train.'), 'Eat first, then train.');
  });

  it('drops a filler opener', () => {
    assert.equal(humanize('Great question! Your readiness is 72.'), 'Your readiness is 72.');
    assert.equal(humanize('Absolutely, here is the plan.'), 'Here is the plan.');
  });

  it('leaves normal text and JSON alone', () => {
    const text = 'Readiness 55/100. Eat 30 g of protein at dinner.';
    assert.equal(humanize(text), text);
    const json = '[{"title":"Monday – Upper","reps":"8-12"}]';
    assert.equal(humanize(json), json);
    assert.equal(humanize(undefined), undefined);
  });

  it('is part of the coach prompt, which itself avoids the words it bans', () => {
    assert.ok(COACH_SYSTEM_PROMPT.includes(VOICE_RULES));
    const rest = COACH_SYSTEM_PROMPT.replace(VOICE_RULES, '');
    assert.doesNotMatch(rest, /—|personali[sz]e|journey|crucial|boost/i);
  });
});
