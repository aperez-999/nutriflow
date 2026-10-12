import { useEffect, useRef } from 'react';
import { Box, VisuallyHidden } from '@chakra-ui/react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { DURATION, EASE_OUT } from './tokens';


const MotionBox = motion(Box);

/**
 * The one enter used for content that replaces other content in place (tab panels,
 * switched views): a short fade and rise. Mount it fresh on each switch (lazy tabs or
 * a changing key) so nothing animates from a stale, hidden layout.
 */
export function SwapIn({ children, ...props }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE_OUT }}
      {...props}
    >
      {children}
    </MotionBox>
  );
}

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
