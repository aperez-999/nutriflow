import { memo } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { describeMuscles } from './anatomy';

/**
 * Front and back body map. Muscle ids match backend/data/exerciseCatalog.js (MUSCLES).
 * Each muscle is drawn once on the left half and mirrored, as separate segments with
 * small gaps, so the figure reads as a training diagram rather than an illustration.
 */

const FRONT_W = 120; // front figure spans x 0-120, back figure x 120-240

const mirror = (d, axis) =>
  d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${(2 * axis - Number(x)).toFixed(1)},${y}`);

// Left-side shapes as SVG path data (x,y pairs only, so they can be mirrored).
const FRONT = {
  shoulders: 'M41,43 C33,43 27,48 26,57 C30,57 35,55 41,51 Z',
  chest: 'M58,46 L44,47 C39,50 38,60 41,66 C47,70 54,70 58,68 Z',
  biceps: 'M26,60 C23,66 23,76 26,84 C29,84 32,80 33,73 C33,66 31,61 26,60 Z',
  forearms: 'M25,87 C21,94 20,104 22,112 L27,112 C30,104 31,95 30,87 Z',
  obliques: 'M41,70 C38,80 39,96 43,110 L48,110 L48,72 Z',
  abs: 'M50,71 L58,71 L58,82 L50,82 Z M50,84 L58,84 L58,95 L50,95 Z M50,97 L58,97 L58,110 L50,110 Z',
  quads: 'M43,118 C38,134 39,160 44,180 L53,180 C56,162 57,140 56,124 C52,120 47,118 43,118 Z',
  adductors: 'M57,124 C58,136 58,148 55,160 C53,150 54,136 57,124 Z',
  calves: 'M44,188 C41,198 42,212 45,224 L51,224 C53,212 53,198 51,188 Z',
};

const BACK = {
  traps: 'M180,34 L166,44 L172,52 L180,62 Z',
  shoulders: 'M161,43 C153,43 147,48 146,57 C150,57 155,55 161,51 Z',
  upperBack: 'M180,62 L172,52 L163,54 L165,72 L180,76 Z',
  lats: 'M163,56 C157,62 156,78 160,96 L172,104 L172,80 L165,74 Z',
  triceps: 'M146,60 C143,66 143,76 146,84 C149,84 152,80 153,73 C153,66 151,61 146,60 Z',
  forearms: 'M145,87 C141,94 140,104 142,112 L147,112 C150,104 151,95 150,87 Z',
  lowerBack: 'M174,82 L180,80 L180,110 L174,108 Z',
  glutes: 'M179,114 C170,113 163,118 163,128 C164,136 172,139 179,136 Z',
  hamstrings: 'M163,140 C160,154 161,168 165,182 L174,182 C177,168 178,152 177,140 Z',
  calves: 'M164,188 C160,198 161,212 165,224 L172,224 C174,212 174,198 171,188 Z',
};

// Non-muscle parts of the silhouette (head, neck, hands, feet, knees), left side.
const FRONT_BASE = 'M55,34 L60,34 L60,42 L55,42 Z M21,114 C19,120 21,126 25,126 C28,124 28,118 27,114 Z M43,182 L53,182 L52,187 L44,187 Z M44,226 L52,226 L54,234 L42,234 Z';
const BACK_BASE = mirror(FRONT_BASE, 60).replace(/(-?\d+(?:\.\d+)?),/g, (m, x) => `${(Number(x) + FRONT_W).toFixed(1)},`);

const both = (shapes, axis) =>
  Object.fromEntries(Object.entries(shapes).map(([id, d]) => [id, `${d} ${mirror(d, axis)}`]));

const FRONT_PATHS = both(FRONT, 60);
const BACK_PATHS = both(BACK, 180);

const COLORS = {
  primary: 'var(--chakra-colors-train-solid)',
  secondary: 'var(--chakra-colors-train-300)',
  idle: 'var(--chakra-colors-border)',
  base: 'var(--chakra-colors-bg-muted)',
};

function Muscles({ paths, primary, secondary }) {
  return Object.entries(paths).map(([id, d]) => {
    const state = primary.includes(id) ? 'primary' : secondary.includes(id) ? 'secondary' : 'idle';
    return (
      <path
        key={id}
        d={d}
        fill={COLORS[state]}
        fillOpacity={state === 'secondary' ? 0.75 : 1}
        style={{ transition: 'fill 0.25s ease' }}
      />
    );
  });
}

function AnatomyFigure({ primary = [], secondary = [], height = 180, showLegend = false }) {
  return (
    <Box>
      <Box
        as="svg"
        viewBox="8 6 224 232"
        h={`${height}px`}
        w="auto"
        maxW="100%"
        display="block"
        mx="auto"
        role="img"
        aria-label={describeMuscles(primary, secondary)}
      >
        {/* Heads */}
        <circle cx="60" cy="21" r="12" fill={COLORS.base} />
        <circle cx="180" cy="21" r="12" fill={COLORS.base} />
        <path d={`${FRONT_BASE} ${mirror(FRONT_BASE, 60)}`} fill={COLORS.base} />
        <path d={`${BACK_BASE} ${mirror(BACK_BASE, 180)}`} fill={COLORS.base} />
        <Muscles paths={FRONT_PATHS} primary={primary} secondary={secondary} />
        <Muscles paths={BACK_PATHS} primary={primary} secondary={secondary} />
      </Box>
      {showLegend && (
        <HStack spacing={4} justify="center" mt={3} fontSize="xs" color="fg.muted">
          <HStack spacing={1.5}><Box boxSize="10px" borderRadius="2px" bg="train.solid" /><Text>Main</Text></HStack>
          <HStack spacing={1.5}><Box boxSize="10px" borderRadius="2px" bg="train.300" opacity={0.75} /><Text>Helps</Text></HStack>
          <Text>Front, back</Text>
        </HStack>
      )}
    </Box>
  );
}

export default memo(AnatomyFigure);
