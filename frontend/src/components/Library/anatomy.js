// Plain-language names for the muscle ids used by the catalog and AnatomyFigure.
export const LABEL = {
  chest: 'chest', shoulders: 'shoulders', biceps: 'biceps', triceps: 'triceps', forearms: 'forearms',
  abs: 'abs', obliques: 'obliques', traps: 'traps', lats: 'lats', upperBack: 'upper back',
  lowerBack: 'lower back', glutes: 'glutes', quads: 'quads', hamstrings: 'hamstrings',
  adductors: 'inner thighs', calves: 'calves',
};

export const describeMuscles = (primary = [], secondary = []) => {
  const main = primary.map((m) => LABEL[m] || m).join(', ');
  const also = secondary.map((m) => LABEL[m] || m).join(', ');
  return also ? `Works ${main}; also ${also}.` : `Works ${main}.`;
};
