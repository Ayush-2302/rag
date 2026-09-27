/**
 * Centralized Design System Tokens Reference.
 * Matches CSS variables defined in src/index.css.
 */

export const COLOR_TOKENS = {
  brand: {
    primary: 'var(--primary)',
    primaryHover: 'var(--primary-hover)',
    primaryActive: 'var(--primary-active)',
    primarySoft: 'var(--primary-soft)',
    secondary: 'var(--secondary)',
    secondarySoft: 'var(--secondary-soft)',
  },
  background: {
    background: 'var(--background)',
    surface: 'var(--surface)',
    surfaceSoft: 'var(--surface-soft)',
    surfaceHover: 'var(--surface-hover)',
    surfaceActive: 'var(--surface-active)',
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    muted: 'var(--text-muted)',
    disabled: 'var(--text-disabled)',
    inverse: 'var(--text-inverse)',
  },
  border: {
    default: 'var(--border)',
    light: 'var(--border-light)',
    hover: 'var(--border-hover)',
    focus: 'var(--border-focus)',
  },
  status: {
    success: 'var(--success)',
    successSoft: 'var(--success-soft)',
    warning: 'var(--warning)',
    warningSoft: 'var(--warning-soft)',
    danger: 'var(--danger)',
    dangerSoft: 'var(--danger-soft)',
    info: 'var(--info)',
    infoSoft: 'var(--info-soft)',
  },
  semantic: {
    focusRing: 'var(--focus-ring)',
    overlay: 'var(--overlay)',
    selection: 'var(--selection)',
    link: 'var(--link)',
    linkHover: 'var(--link-hover)',
  },
};

export const RADIUS_TOKENS = {
  sm: 'var(--radius-sm)', // 4px
  md: 'var(--radius-md)', // 6px
  lg: 'var(--radius-lg)', // 8px
  xl: 'var(--radius-xl)', // 12px
  full: 'var(--radius-full)', // 9999px
};

export const SHADOW_TOKENS = {
  none: 'var(--shadow-none)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
};

export const SPACING_TOKENS = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

export const TYPOGRAPHY_TOKENS = {
  display: 'text-3xl font-bold tracking-tight',
  h1: 'text-2xl font-bold tracking-tight',
  h2: 'text-xl font-semibold tracking-tight',
  h3: 'text-lg font-semibold tracking-tight',
  h4: 'text-base font-semibold',
  bodyLarge: 'text-base font-normal leading-relaxed',
  body: 'text-sm font-normal leading-normal',
  bodySmall: 'text-xs font-normal leading-normal',
  caption: 'text-xs font-medium text-text-muted',
  label: 'text-xs font-semibold uppercase tracking-wider text-text-muted',
};
