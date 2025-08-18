export const getExerciseMeta = (ex = {}, workout = {}) => {
  const name = String(ex.name || '').toLowerCase();
  const focuses = (workout.focusAreas || []).map(f => String(f).toLowerCase());

  const meta = {
    setup: [],
    eccentric: '',
    pause: '',
    concentric: '',
    easier: [],
    harder: [],
    mistakes: []
  };

  const pushPatterns = (arr, items) => { items.forEach(i => arr.push(i)); };

  if (name.includes('squat')) {
    pushPatterns(meta.setup, ['Feet shoulder-width, toes slightly out', 'Brace core, neutral spine', 'Knees track over toes']);
    meta.eccentric = 'Sit back and down under control (3s)';
    meta.pause = 'Brief pause at depth (1s)';
    meta.concentric = 'Drive through mid-foot to stand (1s)';
    pushPatterns(meta.easier, ['Box squat', 'Goblet squat (lighter load)']);
    pushPatterns(meta.harder, ['Front squat', 'Tempo squat (3-1-1)']);
    pushPatterns(meta.mistakes, ['Knees cave inward', 'Heels lifting off the floor', 'Rounding lower back']);
  } else if (name.includes('deadlift')) {
    pushPatterns(meta.setup, ['Bar over mid-foot', 'Hinge at hips, neutral spine', 'Lats engaged, bar close']);
    meta.eccentric = 'Lower with tension, hinge back (2-3s)';
    meta.pause = 'Reset tightness (1s)';
    meta.concentric = 'Push the floor away, stand tall (1s)';
    pushPatterns(meta.easier, ['Romanian deadlift with light weight', 'Kettlebell deadlift']);
    pushPatterns(meta.harder, ['Deficit deadlift', 'Paused deadlift']);
    pushPatterns(meta.mistakes, ['Rounding back', 'Bar drifting away from shins', 'Jerking the bar off the floor']);
  } else if (name.includes('bench') || name.includes('press')) {
    pushPatterns(meta.setup, ['Shoulders retracted', 'Feet planted, slight arch', 'Grip even, wrists stacked']);
    meta.eccentric = 'Lower bar to mid-chest (2-3s)';
    meta.pause = 'Brief chest touch (0-1s)';
    meta.concentric = 'Press bar up & back over shoulders (1s)';
    pushPatterns(meta.easier, ['Push-up on knees', 'Dumbbell press (lighter)']);
    pushPatterns(meta.harder, ['Close-grip press', 'Tempo press (3-1-1)']);
    pushPatterns(meta.mistakes, ['Elbows flared too wide', 'Bouncing bar off chest', 'Losing upper back tightness']);
  } else if (name.includes('row')) {
    pushPatterns(meta.setup, ['Hinge at hips, flat back', 'Neutral neck, core braced', 'Hands under shoulders (if supported)']);
    meta.eccentric = 'Lower slowly, keep lats engaged (2-3s)';
    meta.pause = 'Squeeze shoulder blades (1s)';
    meta.concentric = 'Row toward lower ribs (1s)';
    pushPatterns(meta.easier, ['Chest-supported row', 'Band-assisted row']);
    pushPatterns(meta.harder, ['Single-arm row (slow eccentrics)', 'Meadows row']);
    pushPatterns(meta.mistakes, ['Shrugging shoulders', 'Using momentum', 'Rounding upper back']);
  } else if (name.includes('lunge')) {
    pushPatterns(meta.setup, ['Tall posture, ribs down', 'Step hip-width for balance', 'Front knee tracks over toes']);
    meta.eccentric = 'Lower straight down (2-3s)';
    meta.pause = 'Light tap at bottom (0-1s)';
    meta.concentric = 'Drive through front heel (1s)';
    pushPatterns(meta.easier, ['Assisted lunge (hold support)', 'Shorter range of motion']);
    pushPatterns(meta.harder, ['Walking lunges', 'Bulgarian split squat']);
    pushPatterns(meta.mistakes, ['Knee collapsing in', 'Short stride causing heel lift']);
  } else if (name.includes('push-up')) {
    pushPatterns(meta.setup, ['Wrists under shoulders', 'Glutes & core tight', 'Body in a straight line']);
    meta.eccentric = 'Lower chest toward floor (2s)';
    meta.pause = 'Brief pause above floor (1s)';
    meta.concentric = 'Press through palms to lockout (1s)';
    pushPatterns(meta.easier, ['Incline push-up', 'Knee push-up']);
    pushPatterns(meta.harder, ['Decline push-up', 'Feet elevated or tempo']);
    pushPatterns(meta.mistakes, ['Hips sagging', 'Flaring elbows', 'Neck craned forward']);
  } else if (name.includes('plank')) {
    pushPatterns(meta.setup, ['Elbows under shoulders', 'Glutes & quads tight', 'Neutral spine & neck']);
    meta.eccentric = 'Maintain tension (isometric)';
    meta.pause = 'N/A';
    meta.concentric = 'N/A';
    pushPatterns(meta.easier, ['Knees down plank', 'High plank with wider stance']);
    pushPatterns(meta.harder, ['Weighted plank', 'RKC plank (max tension)']);
    pushPatterns(meta.mistakes, ['Dropping hips', 'Butt too high', 'Holding breath']);
  } else if (name.includes('bike') || name.includes('run') || name.includes('treadmill')) {
    pushPatterns(meta.setup, ['Warm-up 5 minutes easy', 'Set interval timer', 'Maintain relaxed shoulders']);
    meta.eccentric = 'Recovery intervals easy pace';
    meta.pause = 'N/A';
    meta.concentric = 'Work intervals strong but controlled';
    pushPatterns(meta.easier, ['Shorter intervals, longer recoveries', 'Lower resistance or incline']);
    pushPatterns(meta.harder, ['Longer intervals, shorter recoveries', 'Add incline or resistance']);
    pushPatterns(meta.mistakes, ['Starting too fast', 'Skipping warm-up', 'Poor pacing']);
  } else {
    // Generic defaults vary slightly based on focus
    const isLower = focuses.some(f => ['legs','lower body','glutes','hamstrings','quads'].includes(f));
    const isUpper = focuses.some(f => ['upper body','chest','back','shoulders','arms','biceps','triceps'].includes(f));
    pushPatterns(meta.setup, [
      isLower ? 'Brace core, neutral spine, balanced stance' : isUpper ? 'Set shoulder blades, ribs down' : 'Neutral spine, light brace',
      isLower ? 'Feet hip-to-shoulder width' : isUpper ? 'Grip set, wrists stacked' : 'Maintain steady breathing',
    ]);
    meta.eccentric = isLower ? 'Control the lowering phase (2-3s)' : 'Lower with control (2-3s)';
    meta.pause = 'Brief pause if needed for stability (1s)';
    meta.concentric = isLower ? 'Drive smoothly to the start position (1s)' : 'Return to start under control (1s)';
    pushPatterns(meta.easier, [isLower ? 'Reduce range or load' : 'Lighten load or reduce ROM', 'Use support if balance is limiting']);
    pushPatterns(meta.harder, [isLower ? 'Add tempo or load' : 'Increase time under tension', 'Progress to unilateral variants']);
    pushPatterns(meta.mistakes, [isLower ? 'Knees cave in' : 'Shrugging or flared elbows', 'Rushing reps, losing control']);
  }

  return meta;
};

export const getWorkoutBenefits = (workout = {}) => {
  const focuses = (workout.focusAreas || []).map(f => String(f).toLowerCase());
  const benefits = [];
  if (focuses.includes('cardio')) benefits.push('Improves aerobic capacity and endurance');
  if (focuses.includes('core')) benefits.push('Enhances trunk stability and posture');
  if (focuses.some(f => ['upper body','chest','back','shoulders','arms','biceps','triceps'].includes(f))) benefits.push('Builds upper-body strength and muscle tone');
  if (focuses.some(f => ['legs','lower body','glutes','hamstrings','quads'].includes(f))) benefits.push('Develops lower-body strength and power');
  if (benefits.length < 3) benefits.push('Supports overall health and energy levels');
  return benefits;
};
