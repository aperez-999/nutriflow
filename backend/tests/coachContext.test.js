import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dayKeyIn, describeCoachContext, safeTimeZone, targetsFor } from '../ai/tools/get_coach_context.js';
import { groundedNote, takeRememberedNote } from '../ai/utils/coachMemory.js';

// Wednesday 28 October 2026, 9 pm in New York (01:00 UTC on the 29th).
const NOW = new Date('2026-10-29T01:00:00Z');
const NY = 'America/New_York';

const user = {
  username: 'Sam',
  goals: { dailyCalories: 2200, dailyProtein: 160, weeklyWorkouts: 4, fuelFollowsVerdict: true, pushCarbBoost: 20, recoveryCarbCut: 15 },
  about: { goal: 'Build muscle', diet: ['Vegetarian', 'No nuts'], injuries: 'Left knee, no jumping' },
};

describe('the coach brief', () => {
  it('counts the day on the person\'s calendar, not the server\'s', () => {
    assert.equal(dayKeyIn(NOW, NY), '2026-10-28');
    assert.equal(dayKeyIn(NOW, 'UTC'), '2026-10-29');
    assert.equal(safeTimeZone('Mars/Olympus'), 'UTC');
    assert.equal(safeTimeZone(undefined), 'UTC');
  });

  it('works out today\'s targets the way the apps do', () => {
    assert.deepEqual(targetsFor({ dailyCalories: 2000, dailyProtein: 150 }, 'moderate'), { calories: 2000, protein: 150, carbs: 199, fats: 67, carbChange: 0 });
    assert.deepEqual(targetsFor({ dailyCalories: 2000, dailyProtein: 150 }, 'low'), { calories: 1880, protein: 150, carbs: 169, fats: 67, carbChange: -30 });
    assert.equal(targetsFor({ dailyCalories: 2000, dailyProtein: 150, fuelFollowsVerdict: false }, 'high').carbChange, 0);
  });

  it('describes the person, their day and their week with real numbers', () => {
    const brief = describeCoachContext({
      user,
      timeZone: NY,
      now: NOW,
      verdict: { level: 'low', score: 44 },
      diets: [
        { date: '2026-10-28T16:00:00Z', calories: 640, protein: 38, carbs: 80, fats: 14 },
        { date: '2026-10-28T23:30:00Z', calories: 500, protein: 30, carbs: 60, fats: 15 },
        // The 29th in UTC but still the 28th in New York: counts as today.
        { date: '2026-10-29T00:30:00Z', calories: 100, protein: 10, carbs: 5, fats: 2 },
        { date: '2026-10-27T17:00:00Z', calories: 900, protein: 50, carbs: 100, fats: 30 },
        { date: '2026-10-27T23:00:00Z', calories: 1100, protein: 70, carbs: 120, fats: 40 },
        { date: '2026-10-25T17:00:00Z', calories: 2400, protein: 150, carbs: 250, fats: 80 },
      ],
      workouts: [
        { date: '2026-10-28T11:00:00Z', type: 'Cardio', workoutName: 'Run', duration: 45, intensity: 'High' },
        { date: '2026-10-26T22:00:00Z', type: 'Strength', duration: 60, intensity: 'Medium' },
      ],
      checkIns: [{ dayKey: '2026-10-28', sleepHours: 7.5, energy: 3, soreness: 2, hrvChange: -21.7, restingHrChange: 7 }],
      notes: [{ text: 'Lactose intolerant' }, { text: 'Trains at 6 am before work' }],
    });

    assert.match(brief, /Training for: Build muscle\. Diet: Vegetarian, No nuts\. Injuries or limits: Left knee, no jumping\./);
    assert.match(brief, /What they told you before: Lactose intolerant; Trains at 6 am before work\./);
    assert.match(brief, /Today \(Wednesday,? 9 PM, their time\):/);
    assert.match(brief, /Verdict: Recovery day, readiness 44\/100\./);
    assert.match(brief, /slept 7\.5 h, energy 3\/5, soreness 2\/5, measured: HRV 22% under their usual, resting heart rate 7 bpm above usual\./);
    assert.match(brief, /Targets: 2,064 kcal, 160 g protein, 192 g carbs \(34 g fewer carbs because of the verdict\), 73 g fat\./);
    assert.match(brief, /Eaten so far \(3 entries\): 1,240 kcal, 78 g protein/);
    assert.match(brief, /Left for today: 824 kcal, 82 g protein\./);
    assert.match(brief, /Trained today: Run 45 min \(high\)\./);
    assert.match(brief, /2 workouts \(1 cardio, 1 strength\), 105 min, 1 hard\. Their goal is 4 a week\./);
    // Per day, not per entry: (2000 + 2400) / 2.
    assert.match(brief, /Food logged on 2 of the previous 7 days, about 2,200 kcal and 135 g protein on those days\./);
  });

  it('says what is missing instead of making it up', () => {
    const brief = describeCoachContext({ user: { username: 'New', goals: {} }, timeZone: NY, now: NOW, verdict: { level: 'nonsense', score: 500 } });
    assert.match(brief, /haven't said what they're training for yet/);
    assert.match(brief, /No check-in yet today\./);
    assert.match(brief, /Nothing eaten logged yet today\./);
    assert.match(brief, /No workouts logged\. Their goal is 5 a week\./);
    assert.doesNotMatch(brief, /What they told you before/);
  });
});

describe('the coach\'s memory tag', () => {
  it('is taken out of the reply and kept as a note', () => {
    const reply = 'Got it, I\'ll keep dairy out of your plans.\n\n[[REMEMBER: Lactose intolerant, avoids dairy.]]';
    assert.deepEqual(takeRememberedNote(reply), { content: 'Got it, I\'ll keep dairy out of your plans.', note: 'Lactose intolerant, avoids dairy' });
  });

  it('keeps only the first note, and leaves replies without one alone', () => {
    const { content, note } = takeRememberedNote('Sure.\n[[REMEMBER: Trains at 6 am]]\n[[ remember : Has a dog ]]');
    assert.equal(content, 'Sure.');
    assert.equal(note, 'Trains at 6 am');
    assert.deepEqual(takeRememberedNote('Eat 30 g of protein.'), { content: 'Eat 30 g of protein.', note: null });
    assert.deepEqual(takeRememberedNote('Hi [[REMEMBER: ]] there'), { content: 'Hi\nthere', note: null });
  });
});

describe('what the coach may remember', () => {
  const userName = 'sam42';

  it('keeps a fact from what the person just said, without their name', () => {
    assert.equal(groundedNote('sam42 is lactose intolerant', { message: "Heads up, I'm lactose intolerant.", userName }), 'Lactose intolerant');
    assert.equal(groundedNote('Trains at 6 am before work', { message: 'fyi I usually train at 6am before work', userName }), 'Trains at 6 am before work');
    assert.equal(groundedNote("sam42 has a home gym with dumbbells", { message: 'I only have dumbbells at home', userName }), 'Has a home gym with dumbbells');
  });

  it("drops a note the message didn't give it", () => {
    assert.equal(groundedNote('Vegetarian, builds muscle, left knee', { message: 'What should I eat for dinner?', userName }), null);
    assert.equal(groundedNote('Left knee limits jumping', { message: 'Should I do legs tomorrow?', userName }), null);
    assert.equal(groundedNote(null, { message: 'anything' }), null);
  });
});
