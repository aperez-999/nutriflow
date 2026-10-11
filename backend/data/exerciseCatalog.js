/**
 * Curated exercise catalog. The source of truth for the Exercise collection:
 * ensureExerciseCatalog() upserts these by slug, so editing this file updates the DB.
 *
 * Muscle ids match the anatomy diagram on the frontend (components/Library/AnatomyFigure).
 */
export const MUSCLES = [
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'traps',
  'lats', 'upperBack', 'lowerBack', 'glutes', 'quads', 'hamstrings', 'adductors', 'calves',
];

export const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs', 'Glutes', 'Full Body', 'Cardio', 'Mobility'];
export const EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell', 'Cable', 'Machine', 'Bands'];
export const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced'];

// Verified demo videos were carried over from the original library; newer entries link to a
// YouTube search rather than a guessed video id that might not exist.
const search = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} proper form`)}`;

export const EXERCISE_CATALOG = [
  {
    slug: 'push-up', name: 'Push-ups', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['chest'], secondary: ['triceps', 'shoulders', 'abs'],
    summary: 'A reliable push pattern for warm-ups, strength and conditioning.',
    cues: ['Hands just wider than shoulders, body in one straight line.', 'Lower until your chest is a fist from the floor.', 'Press the floor away and keep ribs tucked.'],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  },
  {
    slug: 'incline-push-up', name: 'Incline Push-ups', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['chest'], secondary: ['triceps', 'shoulders'],
    summary: 'An easier push-up with the hands raised; friendly on the shoulders.',
    cues: ['Hands on a bench or counter, feet back.', 'Lower your chest to the edge with elbows at about 45 degrees.', 'Lower the surface over the weeks to progress.'],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  },
  {
    slug: 'bench-press', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate',
    primary: ['chest'], secondary: ['triceps', 'shoulders'],
    summary: 'The classic upper-body strength lift for chest, triceps and front delts.',
    cues: ['Shoulder blades pinched, feet planted.', 'Lower the bar to the lower chest under control.', 'Drive up and slightly back over the shoulders.'],
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  },
  {
    slug: 'dumbbell-fly', name: 'Dumbbell Fly', muscleGroup: 'Chest', equipment: 'Dumbbells', difficulty: 'Intermediate',
    primary: ['chest'], secondary: ['shoulders'],
    summary: 'Chest isolation through a long, controlled range of motion.',
    cues: ['Soft bend in the elbows that never changes.', 'Open wide until you feel a stretch, not pain.', 'Hug the weights back up over the chest.'],
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
  },
  {
    slug: 'dips', name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'Advanced',
    primary: ['chest', 'triceps'], secondary: ['shoulders'],
    summary: 'A bodyweight press that builds the lower chest and triceps.',
    cues: ['Lean slightly forward with shoulders down.', 'Lower until upper arms are about parallel to the floor.', 'Press up without shrugging.'],
    videoUrl: search('chest dips'),
  },
  {
    slug: 'pull-up', name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Bodyweight', difficulty: 'Advanced',
    primary: ['lats'], secondary: ['biceps', 'upperBack', 'forearms'],
    summary: 'The benchmark upper-back and lat strength movement.',
    cues: ['Start from a dead hang with shoulders engaged.', 'Pull your chest toward the bar, elbows to your ribs.', 'Lower all the way under control.'],
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  },
  {
    slug: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', difficulty: 'Intermediate',
    primary: ['lats'], secondary: ['biceps', 'upperBack'],
    summary: 'Builds vertical pulling strength with adjustable load.',
    cues: ['Grip just outside shoulder width, chest up.', 'Pull the bar to the top of your chest.', 'Let the arms rise fully before the next rep.'],
    videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
  },
  {
    slug: 'seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cable', difficulty: 'Intermediate',
    primary: ['upperBack', 'lats'], secondary: ['biceps', 'forearms'],
    summary: 'A horizontal pull for mid-back thickness and posture.',
    cues: ['Sit tall with a slight bend in the knees.', 'Row the handle to your stomach, squeezing the shoulder blades.', 'Reach forward without rounding the lower back.'],
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
  },
  {
    slug: 'single-arm-row', name: 'Single-arm Row', muscleGroup: 'Back', equipment: 'Dumbbells', difficulty: 'Beginner',
    primary: ['lats', 'upperBack'], secondary: ['biceps'],
    summary: 'Works each side on its own to even out imbalances.',
    cues: ['One hand and knee on a bench, back flat.', 'Row the dumbbell toward your hip.', 'Lower with a full stretch at the bottom.'],
    videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
  },
  {
    slug: 'face-pull', name: 'Face Pull', muscleGroup: 'Back', equipment: 'Cable', difficulty: 'Beginner',
    primary: ['upperBack', 'shoulders'], secondary: ['traps'],
    summary: 'Upper-back and rear-shoulder work that balances all the pressing.',
    cues: ['Rope at face height, thumbs pointing back.', 'Pull toward your eyes and spread the rope apart.', 'Pause, then return slowly.'],
    videoUrl: search('cable face pull'),
  },
  {
    slug: 'deadlift', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell', difficulty: 'Advanced',
    primary: ['hamstrings', 'glutes', 'lowerBack'], secondary: ['traps', 'forearms', 'quads'],
    summary: 'A full posterior-chain strength lift from the floor.',
    cues: ['Bar over mid-foot, hips hinged, back flat.', 'Push the floor away and keep the bar close.', 'Finish tall with glutes, not by leaning back.'],
    videoUrl: search('barbell deadlift'),
  },
  {
    slug: 'squat', name: 'Squats', muscleGroup: 'Legs', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['quads', 'glutes'], secondary: ['hamstrings', 'abs'],
    summary: 'The foundational lower-body movement for strength and mobility.',
    cues: ['Feet shoulder width, toes slightly out.', 'Sit down between your heels with chest up.', 'Drive up through the whole foot.'],
    videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
  },
  {
    slug: 'goblet-squat', name: 'Goblet Squat', muscleGroup: 'Legs', equipment: 'Dumbbells', difficulty: 'Beginner',
    primary: ['quads', 'glutes'], secondary: ['abs', 'adductors'],
    summary: 'A front-loaded squat that teaches great depth and posture.',
    cues: ['Hold the weight at your chest, elbows down.', 'Squat between your knees as deep as you can stay upright.', 'Stand up without letting the chest drop.'],
    videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4',
  },
  {
    slug: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroup: 'Legs', equipment: 'Dumbbells', difficulty: 'Advanced',
    primary: ['hamstrings', 'glutes'], secondary: ['lowerBack', 'forearms'],
    summary: 'A hip hinge that builds strong hamstrings and glutes.',
    cues: ['Soft knees, push the hips back.', 'Slide the weights down your legs until the hamstrings stretch.', 'Squeeze the glutes to stand.'],
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
  },
  {
    slug: 'walking-lunge', name: 'Walking Lunge', muscleGroup: 'Legs', equipment: 'Dumbbells', difficulty: 'Intermediate',
    primary: ['quads', 'glutes'], secondary: ['hamstrings', 'adductors'],
    summary: 'Single-leg strength, balance and coordination in one move.',
    cues: ['Long step, lower the back knee toward the floor.', 'Keep the front knee over the mid-foot.', 'Push through the front heel into the next step.'],
    videoUrl: 'https://www.youtube.com/watch?v=wrwwXE_x-pQ',
  },
  {
    slug: 'leg-press', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'Beginner',
    primary: ['quads'], secondary: ['glutes', 'hamstrings'],
    summary: 'Heavy leg work with the back supported.',
    cues: ['Feet shoulder width in the middle of the plate.', 'Lower until the knees reach about 90 degrees.', 'Press without locking the knees hard.'],
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
  },
  {
    slug: 'standing-calf-raise', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'Beginner',
    primary: ['calves'], secondary: [],
    summary: 'Simple, direct calf strength for running and jumping.',
    cues: ['Balls of the feet on the edge, heels free.', 'Rise as high as you can and pause.', 'Lower slowly into a full stretch.'],
    videoUrl: 'https://www.youtube.com/watch?v=YMmgqO8Jo-k',
  },
  {
    slug: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Glutes', equipment: 'Dumbbells', difficulty: 'Advanced',
    primary: ['glutes', 'quads'], secondary: ['hamstrings', 'adductors'],
    summary: 'A demanding single-leg squat for glutes and quads.',
    cues: ['Back foot on a bench, front foot well forward.', 'Drop straight down with a slight forward lean.', 'Drive through the front heel.'],
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
  },
  {
    slug: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'Glutes', equipment: 'Barbell', difficulty: 'Intermediate',
    primary: ['glutes'], secondary: ['hamstrings', 'quads'],
    summary: 'The most direct way to load the glutes.',
    cues: ['Upper back on a bench, bar over the hips.', 'Drive the hips up until the body is flat from knees to shoulders.', 'Pause and squeeze before lowering.'],
    videoUrl: search('barbell hip thrust'),
  },
  {
    slug: 'glute-bridge', name: 'Glute Bridge', muscleGroup: 'Glutes', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['glutes'], secondary: ['hamstrings', 'abs'],
    summary: 'A floor-based glute builder and warm-up staple.',
    cues: ['Lie on your back, feet flat near your hips.', 'Press through the heels to lift the hips.', 'Hold a second at the top.'],
    videoUrl: search('glute bridge'),
  },
  {
    slug: 'plank', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['abs'], secondary: ['obliques', 'shoulders', 'glutes'],
    summary: 'Teaches the core to brace and resist movement.',
    cues: ['Forearms under shoulders, body in a straight line.', 'Squeeze glutes and pull ribs down.', 'Breathe steadily; stop when form slips.'],
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  },
  {
    slug: 'side-plank', name: 'Side Plank', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['obliques'], secondary: ['abs', 'shoulders', 'glutes'],
    summary: 'Side-on bracing for the obliques and hips.',
    cues: ['Elbow under shoulder, feet stacked.', 'Lift the hips into one straight line.', 'Keep the top hip from rolling forward.'],
    videoUrl: search('side plank'),
  },
  {
    slug: 'dead-bug', name: 'Dead Bug', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['abs'], secondary: ['obliques'],
    summary: 'Core control with the lower back staying on the floor.',
    cues: ['Lower back pressed into the floor.', 'Extend opposite arm and leg slowly.', 'Return and switch sides without arching.'],
    videoUrl: 'https://www.youtube.com/watch?v=4XLEnwUr1d8',
  },
  {
    slug: 'pallof-press', name: 'Pallof Press', muscleGroup: 'Core', equipment: 'Cable', difficulty: 'Intermediate',
    primary: ['obliques', 'abs'], secondary: ['shoulders'],
    summary: 'Anti-rotation strength that protects the lower back.',
    cues: ['Stand side-on to the cable, handle at your chest.', 'Press straight out and resist the pull.', 'Hold, then bring it back slowly.'],
    videoUrl: 'https://www.youtube.com/watch?v=FQskThL0VJg',
  },
  {
    slug: 'mountain-climber', name: 'Mountain Climbers', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['abs'], secondary: ['shoulders', 'quads', 'obliques'],
    summary: 'Fast core work that doubles as conditioning.',
    cues: ['Start in a high plank, shoulders over hands.', 'Drive the knees toward the chest one at a time.', 'Keep the hips level as the pace rises.'],
    videoUrl: search('mountain climbers exercise'),
  },
  {
    slug: 'shoulder-press', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Intermediate',
    primary: ['shoulders'], secondary: ['triceps', 'traps'],
    summary: 'Overhead strength for the shoulders and triceps.',
    cues: ['Dumbbells at shoulder height, palms forward.', 'Press up and slightly in without arching the back.', 'Lower to ear level under control.'],
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
  },
  {
    slug: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner',
    primary: ['shoulders'], secondary: ['traps'],
    summary: 'Builds the side of the shoulders for width.',
    cues: ['Slight bend in the elbows, light weights.', 'Raise to shoulder height leading with the elbows.', 'Lower slowly; no swinging.'],
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
  },
  {
    slug: 'bicep-curl', name: 'Bicep Curl', muscleGroup: 'Arms', equipment: 'Dumbbells', difficulty: 'Beginner',
    primary: ['biceps'], secondary: ['forearms'],
    summary: 'Straightforward arm work for the biceps.',
    cues: ['Elbows pinned at your sides.', 'Curl up while turning the palms toward you.', 'Lower all the way without swinging.'],
    videoUrl: 'https://www.youtube.com/watch?v=av7-8igSXTs',
  },
  {
    slug: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'Arms', equipment: 'Dumbbells', difficulty: 'Beginner',
    primary: ['biceps', 'forearms'], secondary: [],
    summary: 'A neutral-grip curl that also builds the forearms.',
    cues: ['Palms face each other the whole time.', 'Curl without the elbows drifting forward.', 'Squeeze at the top, lower slowly.'],
    videoUrl: search('dumbbell hammer curl'),
  },
  {
    slug: 'triceps-pushdown', name: 'Triceps Pushdown', muscleGroup: 'Arms', equipment: 'Cable', difficulty: 'Beginner',
    primary: ['triceps'], secondary: [],
    summary: 'Simple, joint-friendly triceps isolation.',
    cues: ['Elbows tucked at your sides.', 'Push down until the arms are straight.', 'Let the handle rise only to about 90 degrees.'],
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
  },
  {
    slug: 'overhead-triceps-extension', name: 'Overhead Triceps Extension', muscleGroup: 'Arms', equipment: 'Dumbbells', difficulty: 'Intermediate',
    primary: ['triceps'], secondary: ['shoulders'],
    summary: 'Works the triceps in a long, stretched position.',
    cues: ['Hold one dumbbell overhead with both hands.', 'Lower it behind your head, elbows pointing up.', 'Extend fully without flaring the elbows.'],
    videoUrl: search('overhead dumbbell triceps extension'),
  },
  {
    slug: 'kettlebell-swing', name: 'Kettlebell Swing', muscleGroup: 'Full Body', equipment: 'Kettlebell', difficulty: 'Intermediate',
    primary: ['glutes', 'hamstrings'], secondary: ['lowerBack', 'shoulders', 'abs', 'forearms'],
    summary: 'Explosive hip power and conditioning in one move.',
    cues: ['Hinge, hike the bell back between your legs.', 'Snap the hips forward to float it to chest height.', 'Let it fall back into the next hinge.'],
    videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8',
  },
  {
    slug: 'farmers-carry', name: "Farmer's Carry", muscleGroup: 'Full Body', equipment: 'Dumbbells', difficulty: 'Beginner',
    primary: ['forearms', 'traps'], secondary: ['abs', 'obliques', 'glutes'],
    summary: 'Grip, posture and core strength by simply walking heavy.',
    cues: ['Heavy weights at your sides, stand tall.', 'Walk with short, steady steps.', 'Keep the shoulders down and ribs stacked.'],
    videoUrl: search("farmer's carry"),
  },
  {
    slug: 'jump-rope-intervals', name: 'Jump Rope Intervals', muscleGroup: 'Cardio', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['calves'], secondary: ['shoulders', 'forearms', 'quads'],
    summary: 'Quick conditioning that also builds footwork.',
    cues: ['Small hops on the balls of your feet.', 'Turn the rope with the wrists, not the arms.', 'Work 30 seconds, rest 30, repeat.'],
    videoUrl: 'https://www.youtube.com/watch?v=1BZMtlT9cMM',
  },
  {
    slug: 'rowing-machine', name: 'Rowing Machine', muscleGroup: 'Cardio', equipment: 'Machine', difficulty: 'Beginner',
    primary: ['quads', 'upperBack'], secondary: ['lats', 'hamstrings', 'biceps', 'abs'],
    summary: 'Low-impact cardio that works most of the body.',
    cues: ['Legs push first, then lean back, then pull.', 'Return in reverse: arms, body, legs.', 'Keep strokes long and smooth.'],
    videoUrl: search('rowing machine technique'),
  },
  {
    slug: 'mobility-flow', name: 'Mobility Flow', muscleGroup: 'Mobility', equipment: 'Bodyweight', difficulty: 'Beginner',
    primary: ['lowerBack', 'glutes'], secondary: ['hamstrings', 'shoulders', 'adductors'],
    summary: 'A short flow for hips, spine and shoulders on recovery days.',
    cues: ['Move slowly and breathe through each position.', 'Stay in comfortable ranges; no forcing.', 'Ten minutes is plenty on a recovery day.'],
    videoUrl: 'https://www.youtube.com/watch?v=HqFPO5qz0AA',
  },
];
