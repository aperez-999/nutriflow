import { useEffect, useRef } from 'react';
import { VisuallyHidden } from '@chakra-ui/react';
import { animate, useReducedMotion } from 'framer-motion';
import { DURATION, EASE_OUT } from './tokens';


const formatNumber = (value, decimals) =>
  Number(value).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Animates a number from its previous value (0 on first render) to `value`.
 * Assistive tech reads only the final value; the moving digits are aria-hidden.
 */
export function CountUp({ value = 0, decimals = 0, duration = DURATION.slow }) {
  const ref = useRef(null);
  const from = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (reduceMotion) {
      node.textContent = formatNumber(value, decimals);
      from.current = value;
      return undefined;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (latest) => { node.textContent = formatNumber(latest, decimals); },
    });
    from.current = value;
    return () => controls.stop();
  }, [value, decimals, duration, reduceMotion]);

  return (
    <>
      <span ref={ref} aria-hidden="true">{formatNumber(reduceMotion ? value : 0, decimals)}</span>
      <VisuallyHidden>{formatNumber(value, decimals)}</VisuallyHidden>
    </>
  );
}
