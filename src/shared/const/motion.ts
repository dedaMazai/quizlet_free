/** Длительности, мс; синхронно с `--motion-*` */
export const MOTION_MS = {
  instant: 80,
  fast: 140,
  base: 220,
  slow: 360,
  deliberate: 600,
  stagger: 40,
} as const;

/** Кривые для `motion`; синхронно с `--ease-*` */
export const EASE = {
  standard: [0.2, 0, 0, 1],
  enter: [0, 0, 0, 1],
  exit: [0.3, 0, 1, 1],
} as const;

/** Длительность ухода относительно входа */
export const EXIT_FACTOR = 0.7;

/** Модалки: окно scale .98→1 + opacity, фон opacity (классы — в app/styles/motion.scss) */
export const MODAL_MOTION = {
  transitionName: 'zbr-modal',
  maskTransitionName: 'zbr-fade',
} as const;
