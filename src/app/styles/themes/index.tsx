import { ThemeConfig } from 'antd';
import { camelCaseIntoToken } from '@/shared/lib/helpers';
import { DarkTheme } from './dark/index';
import { LightTheme } from './light/index';
import { Theme } from '@/shared/const/theme';

const themeTokens: Record<Theme, ThemeConfig['token']> = {
  [Theme.LIGHT]: LightTheme,
  [Theme.DARK]: DarkTheme,
};

/**
 * Global CSS variables for each theme.
 * These override the defaults from global.scss at runtime.
 */
const globalCssVariables: Record<Theme, Record<string, string>> = {
  [Theme.DARK]: {
    '--scroll-bard-border': '#424244',
    '--scroll-bard': 'rgba(233, 237, 242, 0.15)',
    '--text': '#e9edf2',
    '--text-secondary': '#b7b7ba',
    '--bg-color': '#141b23',
    '--bg-color-secondary': '#1b2530',
    '--inverted-bg-color': '#e9edf2',
    '--help-button-bg': '#1b2530',
    '--field-border': 'rgba(233, 237, 242, 0.14)',
    '--card-bg': 'rgba(233, 237, 242, 0.03)',
    '--card-bg-secondary': '#1b2530',

    // Brand accent + elevation (BACKLOG §6: тени только у оверлеев)
    '--color-accent': '#749dc4',
    '--color-accent-hover': '#94bce3',
    '--color-accent-soft': 'rgba(116, 157, 196, 0.12)',
    '--color-success-soft': 'oklch(25% 0.055 170deg)',
    '--color-error-soft': 'oklch(25% 0.08 27deg)',
    '--color-warning-soft': 'oklch(25% 0.06 80deg)',
    '--shadow-sm': 'none',
    '--shadow-md': '0 12px 32px rgba(0, 0, 0, 0.5)',
    '--shadow-card-hover': 'none',

    // Borders
    '--border-subtle': 'rgba(233, 237, 242, 0.08)',
    '--border-light': 'rgba(233, 237, 242, 0.14)',
    '--border-medium': 'rgba(233, 237, 242, 0.2)',
    '--border-accent': 'rgba(233, 237, 242, 0.3)',
    '--color-border': 'rgba(233, 237, 242, 0.14)',

    // Primary
    '--color-primary-rgb': '233, 237, 242',
    '--color-primary-bg-hover': 'rgba(116, 157, 196, 0.12)',

    // Interactive states
    '--hover-bg': 'rgba(116, 157, 196, 0.12)',
    '--active-bg': 'rgba(116, 157, 196, 0.24)',
    '--hover-bg-light': 'rgba(116, 157, 196, 0.06)',

    // Form fields
    '--field-bg': '#1b2530',
    '--field-label-color': '#b7b7ba',

    // Overlay
    '--overlay-color': 'rgba(0, 0, 0, 0.6)',
    '--overlay-border': '1px solid rgba(233, 237, 242, 0.14)',

    // Semantic colors
    '--color-accent-blue': '#749dc4',
    '--color-star': '#fadb14',
    '--color-logo': '#e9edf2',
    '--code-bg': '#0e141a',
    '--inline-code-bg': 'rgba(233, 237, 242, 0.1)',
    '--inline-code-border': 'rgba(233, 237, 242, 0.14)',
    '--inline-code-color': '#e06c75',
    '--code-line-number': '#98989b',
    '--code-border': 'rgba(233, 237, 242, 0.08)',
    // Syntax token colors (dark - Tokyo Night inspired)
    '--code-keyword': '#bb9af7',
    '--code-string': '#9ece6a',
    '--code-comment': '#8a93b8',
    '--code-function': '#7aa2f7',
    '--code-number': '#ff9e64',
    '--code-operator': '#89ddff',
    '--code-punctuation': '#a9b1d6',
    '--code-boolean': '#ff9e64',
    '--code-class-name': '#2ac3de',
    '--code-builtin': '#7dcfff',
    '--code-property': '#73daca',
    '--code-tag': '#f7768e',
    '--code-attr-name': '#bb9af7',
    '--code-attr-value': '#9ece6a',
    '--code-regex': '#b4f9f8',
    '--code-important': '#f7768e',
    '--code-variable': '#c0caf5',
    '--selection-bg': 'rgba(116, 157, 196, 0.35)',
    '--selection-color': '#e9edf2',
    '--color-icon-secondary': '#98989b',
    '--color-elevated-bg': '#1b2530',
    '--color-spotlight-bg': '#1b2530',

    // Editor highlights
    '--highlight-yellow': '#fef08a',
    '--highlight-green': '#bbf7d0',
    '--highlight-blue': '#bfdbfe',
    '--highlight-pink': '#fbcfe8',
    '--highlight-orange': '#fed7aa',
    '--highlight-purple': '#ddd6fe',

    // Disabled primary button
    '--btn-primary-disabled-color': '#141b23',
    '--btn-primary-disabled-bg': '#749dc4',
    '--btn-primary-disabled-border': '#749dc4',
    '--btn-disabled-opacity': '0.45',

    // Design tokens (BACKLOG §6): base. Каждый ключ обязан быть и в LIGHT,
    // иначе при переключении останется значение предыдущей темы.
    '--color-bg': '#141b23',
    '--color-surface': '#1b2530',
    '--color-text': '#e9edf2',
    '--color-divider': 'rgba(233, 237, 242, 0.14)',
    '--color-brand-ink': '#e9edf2',
    '--color-field-border': 'rgba(233, 237, 242, 0.14)',
    '--shadow-lg': '0 12px 32px rgba(0, 0, 0, 0.5)',

    // Тёмное поле (hero и др.) — роли, а не ramp: в тёмной теме ramp отражён
    '--color-field': '#0e141a',
    '--color-on-field': '#e9edf2',
    '--color-on-field-soft': '#d6ebff',
    '--color-field-line': '#416180',
    '--color-field-button-bg': '#e9edf2',
    '--color-field-button-ink': '#0e141a',
    '--color-field-button-hover': '#d6ebff',

    // Accent ramp (отражён: 100 — самый тёмный тинт, 900 — тёмное поле)
    '--color-accent-100': 'rgba(116, 157, 196, 0.12)',
    '--color-accent-200': 'rgba(116, 157, 196, 0.24)',
    '--color-accent-300': '#b5d9fd',
    '--color-accent-400': '#94bce3',
    '--color-accent-500': '#749dc4',
    '--color-accent-600': '#94bce3',
    '--color-accent-700': '#b5d9fd',
    '--color-accent-800': '#d6ebff',
    '--color-accent-900': '#0e141a',

    // Neutral ramp (отражён)
    '--color-neutral-100': '#2b2b2d',
    '--color-neutral-200': '#424244',
    '--color-neutral-300': '#5d5d60',
    '--color-neutral-400': '#7a7a7d',
    '--color-neutral-500': '#98989b',
    '--color-neutral-600': '#b7b7ba',
    '--color-neutral-700': '#d4d4d7',
    '--color-neutral-800': '#e7e7ea',
    '--color-neutral-900': '#f5f5f8',

    // Heatmap: 5 ступеней от фона к яркому
    '--color-heat-0': '#1b2530',
    '--color-heat-1': '#2c455d',
    '--color-heat-2': '#416180',
    '--color-heat-3': '#749dc4',
    '--color-heat-4': '#b5d9fd',

    // Signals: L +0.08; тинты — L 0.25, C/2; текст на тинте — светлый того же оттенка
    '--color-success': 'oklch(68% 0.11 170deg)',
    '--color-success-tint': 'oklch(25% 0.055 170deg)',
    '--color-success-text': 'oklch(85% 0.06 155deg)',
    '--color-error': 'oklch(58% 0.16 35deg)',
    '--color-error-tint': 'oklch(25% 0.08 27deg)',
    '--color-error-text': 'oklch(85% 0.06 27deg)',
    '--pattern-error-hatch': 'repeating-linear-gradient(135deg, oklch(58% 0.16 35deg) 0 2px, oklch(25% 0.08 35deg) 2px 4px)',
    '--color-warning': 'oklch(80% 0.12 80deg)',
    '--color-warning-tint': 'oklch(25% 0.06 80deg)',
    '--color-warning-text': 'oklch(88% 0.06 70deg)',

    // Streak levels — без изменений; для текста — светлее (контраст ≥4.5 на bg)
    '--streak-0': 'oklch(62% 0.02 250deg)',
    '--streak-0-tint': 'oklch(94% 0.005 250deg)',
    '--streak-0-text': 'oklch(72% 0.02 250deg)',
    '--streak-1': 'oklch(72% 0.12 80deg)',
    '--streak-1-tint': 'oklch(95% 0.04 80deg)',
    '--streak-1-text': 'oklch(78% 0.12 80deg)',
    '--streak-2': 'oklch(66% 0.15 55deg)',
    '--streak-2-tint': 'oklch(94% 0.05 55deg)',
    '--streak-2-text': 'oklch(74% 0.13 55deg)',
    '--streak-3': 'oklch(58% 0.17 35deg)',
    '--streak-3-tint': 'oklch(93% 0.05 35deg)',
    '--streak-3-text': 'oklch(72% 0.13 35deg)',
    '--streak-4': 'oklch(50% 0.17 25deg)',
    '--streak-4-tint': 'oklch(90% 0.06 25deg)',
    '--streak-4-text': 'oklch(72% 0.13 25deg)',

    // Motion
    '--motion-instant': '80ms',
    '--motion-fast': '140ms',
    '--motion-base': '220ms',
    '--motion-slow': '360ms',
    '--motion-deliberate': '600ms',
    '--motion-auto-advance': '1200ms',
    '--ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
    '--ease-enter': 'cubic-bezier(0, 0, 0, 1)',
    '--ease-exit': 'cubic-bezier(0.3, 0, 1, 1)',
  },
  [Theme.LIGHT]: {
    '--scroll-bard-border': '#d9d9d9',
    '--scroll-bard': 'rgba(0, 0, 0, 0.15)',
    '--text': '#1A1A1A',
    '--text-secondary': '#666666',
    '--bg-color': '#F4F5FB',
    '--bg-color-secondary': '#FFFFFF',
    '--inverted-bg-color': '#0E0E0E',
    '--help-button-bg': '#E8E8E8',
    '--field-border': 'rgba(0, 0, 0, 0.15)',
    '--card-bg': 'rgba(0, 0, 0, 0.02)',
    '--card-bg-secondary': '#FAFAFA',

    // Brand accent (indigo) + elevation
    '--color-accent': '#5980a6',
    '--color-accent-hover': '#597ea3',
    '--color-accent-soft': '#eef6ff',
    '--color-success-soft': 'oklch(95% 0.03 170deg)',
    '--color-error-soft': 'oklch(95% 0.025 27deg)',
    '--color-warning-soft': 'oklch(95% 0.04 80deg)',
    '--shadow-sm': '0 1px 2px rgba(43, 43, 45, 0.14)',
    '--shadow-md': '0 3px 10px rgba(43, 43, 45, 0.16)',
    '--shadow-card-hover': '0 10px 28px rgba(66, 85, 255, 0.18)',

    // Borders
    '--border-subtle': 'rgba(0, 0, 0, 0.06)',
    '--border-light': 'rgba(0, 0, 0, 0.1)',
    '--border-medium': 'rgba(0, 0, 0, 0.15)',
    '--border-accent': 'rgba(0, 0, 0, 0.2)',
    '--color-border': 'rgba(0, 0, 0, 0.1)',

    // Primary
    '--color-primary-rgb': '14, 14, 14',
    '--color-primary-bg-hover': 'rgba(0, 0, 0, 0.04)',

    // Interactive states
    '--hover-bg': 'rgba(0, 0, 0, 0.04)',
    '--active-bg': 'rgba(0, 0, 0, 0.08)',
    '--hover-bg-light': 'rgba(0, 0, 0, 0.02)',

    // Form fields
    '--field-bg': '#FFFFFF',
    '--field-label-color': '#666666',

    // Overlay
    '--overlay-color': 'rgba(0, 0, 0, 0.45)',
    '--overlay-border': 'none',

    // Semantic colors
    '--color-accent-blue': '#4255FF',
    '--color-star': '#faad14',
    '--color-logo': '#1A1A1A',
    '--code-bg': '#f5f5f5',
    '--inline-code-bg': 'rgba(0, 0, 0, 0.06)',
    '--inline-code-border': 'rgba(0, 0, 0, 0.12)',
    '--inline-code-color': '#c7254e',
    '--code-line-number': '#999999',
    '--code-border': 'rgba(0, 0, 0, 0.08)',
    // Syntax token colors (light - GitHub-inspired)
    '--code-keyword': '#8250df',
    '--code-string': '#0a3069',
    '--code-comment': '#6e7781',
    '--code-function': '#8250df',
    '--code-number': '#0550ae',
    '--code-operator': '#cf222e',
    '--code-punctuation': '#24292f',
    '--code-boolean': '#0550ae',
    '--code-class-name': '#953800',
    '--code-builtin': '#0550ae',
    '--code-property': '#0550ae',
    '--code-tag': '#116329',
    '--code-attr-name': '#0550ae',
    '--code-attr-value': '#0a3069',
    '--code-regex': '#0a3069',
    '--code-important': '#cf222e',
    '--code-variable': '#24292f',
    '--selection-bg': 'rgba(0, 0, 0, 0.12)',
    '--selection-color': '#1A1A1A',
    '--color-icon-secondary': '#8C8C8C',
    '--color-elevated-bg': '#FFFFFF',
    '--color-spotlight-bg': '#FAFAFA',

    // Editor highlights
    '--highlight-yellow': '#fef9c3',
    '--highlight-green': '#dcfce7',
    '--highlight-blue': '#dbeafe',
    '--highlight-pink': '#fce7f3',
    '--highlight-orange': '#ffedd5',
    '--highlight-purple': '#ede9fe',

    // Disabled primary button
    '--btn-primary-disabled-color': '#ffffff',
    '--btn-primary-disabled-bg': '#5980a6',
    '--btn-primary-disabled-border': '#5980a6',
    '--btn-disabled-opacity': '0.45',

    // Design tokens (README §1): base
    '--color-bg': '#f2f2f3',
    '--color-surface': '#e9e9ea',
    '--color-text': '#1d1f20',
    '--color-divider': 'rgba(29, 31, 32, 0.16)',
    '--color-brand-ink': '#1d2d3d',
    '--color-field-border': '#1d2d3d',
    '--shadow-lg': '0 12px 32px rgba(43, 43, 45, 0.22)',

    // Тёмное поле (hero и др.)
    '--color-field': '#1d2d3d',
    '--color-on-field': '#f2f2f3',
    '--color-on-field-soft': '#d6ebff',
    '--color-field-line': '#416180',
    '--color-field-button-bg': '#f2f2f3',
    '--color-field-button-ink': '#1d2d3d',
    '--color-field-button-hover': '#eef6ff',

    // Accent ramp
    '--color-accent-100': '#eef6ff',
    '--color-accent-200': '#d6ebff',
    '--color-accent-300': '#b5d9fd',
    '--color-accent-400': '#94bce3',
    '--color-accent-500': '#749dc4',
    '--color-accent-600': '#597ea3',
    '--color-accent-700': '#416180',
    '--color-accent-800': '#2c455d',
    '--color-accent-900': '#1d2d3d',

    // Neutral ramp
    '--color-neutral-100': '#f5f5f8',
    '--color-neutral-200': '#e7e7ea',
    '--color-neutral-300': '#d4d4d7',
    '--color-neutral-400': '#b7b7ba',
    '--color-neutral-500': '#98989b',
    '--color-neutral-600': '#7a7a7d',
    '--color-neutral-700': '#5d5d60',
    '--color-neutral-800': '#424244',
    '--color-neutral-900': '#2b2b2d',

    // Heatmap
    '--color-heat-0': '#e7e7ea',
    '--color-heat-1': '#b5d9fd',
    '--color-heat-2': '#749dc4',
    '--color-heat-3': '#416180',
    '--color-heat-4': '#1d2d3d',

    // Signals
    '--color-success': 'oklch(60% 0.11 170deg)',
    '--color-success-tint': 'oklch(95% 0.03 170deg)',
    '--color-success-text': 'oklch(42% 0.08 155deg)',
    '--color-error': 'oklch(50% 0.16 35deg)',
    '--color-error-tint': 'oklch(95% 0.025 27deg)',
    '--color-error-text': 'oklch(45% 0.11 27deg)',
    '--pattern-error-hatch': 'repeating-linear-gradient(135deg, oklch(50% 0.16 35deg) 0 2px, oklch(90% 0.04 35deg) 2px 4px)',
    '--color-warning': 'oklch(72% 0.12 80deg)',
    '--color-warning-tint': 'oklch(95% 0.04 80deg)',
    '--color-warning-text': 'oklch(45% 0.10 70deg)',

    // Streak levels
    '--streak-0': 'oklch(62% 0.02 250deg)',
    '--streak-0-tint': 'oklch(94% 0.005 250deg)',
    '--streak-0-text': 'oklch(62% 0.02 250deg)',
    '--streak-1': 'oklch(72% 0.12 80deg)',
    '--streak-1-tint': 'oklch(95% 0.04 80deg)',
    '--streak-1-text': 'oklch(72% 0.12 80deg)',
    '--streak-2': 'oklch(66% 0.15 55deg)',
    '--streak-2-tint': 'oklch(94% 0.05 55deg)',
    '--streak-2-text': 'oklch(66% 0.15 55deg)',
    '--streak-3': 'oklch(58% 0.17 35deg)',
    '--streak-3-tint': 'oklch(93% 0.05 35deg)',
    '--streak-3-text': 'oklch(58% 0.17 35deg)',
    '--streak-4': 'oklch(50% 0.17 25deg)',
    '--streak-4-tint': 'oklch(90% 0.06 25deg)',
    '--streak-4-text': 'oklch(50% 0.17 25deg)',

    // Motion
    '--motion-instant': '80ms',
    '--motion-fast': '140ms',
    '--motion-base': '220ms',
    '--motion-slow': '360ms',
    '--motion-deliberate': '600ms',
    '--motion-auto-advance': '1200ms',
    '--ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
    '--ease-enter': 'cubic-bezier(0, 0, 0, 1)',
    '--ease-exit': 'cubic-bezier(0.3, 0, 1, 1)',
  },
};

/**
 * Properties that should remain unitless in CSS
 * (font-weight, line-height ratio, z-index, opacity, etc.)
 */
const UNITLESS_PROPERTIES = new Set([
  'fontWeight',
  'fontWeightStrong',
  'lineHeight',
  'lineHeightLG',
  'lineHeightSM',
  'lineHeightHeading1',
  'lineHeightHeading2',
  'lineHeightHeading3',
  'lineHeightHeading4',
  'lineHeightHeading5',
  'zIndexBase',
  'zIndexPopupBase',
  'opacityLoading',
  'opacityImage',
  'motionDurationFast',
  'motionDurationMid',
  'motionDurationSlow',
]);

/**
 * Converts token value to valid CSS value
 * Adds 'px' unit to numeric values that require it
 */
function formatCssValue(key: string, value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'number') {
    if (UNITLESS_PROPERTIES.has(key)) {
      return String(value);
    }
    return `${value}px`;
  }

  return String(value);
}

function parseTokensToCss(token: ThemeConfig['token']) {
  if (!token) {
    return;
  }

  Object.keys(token).forEach((key) => {
    const value = token[key as keyof ThemeConfig['token']];

    const variable = `--${camelCaseIntoToken({
      value: key,
      token: '-',
    })}`;

    const cssValue = formatCssValue(key, value);

    if (cssValue) {
      document.documentElement.style.setProperty(variable, cssValue);
    }
  });
}

/**
 * Sets global CSS variables based on the active theme.
 * These variables are consumed by CSS modules throughout the app.
 */
function setGlobalCssVariables(currentTheme: Theme) {
  const variables = globalCssVariables[currentTheme];
  if (!variables) return;

  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

/**
 * Dark theme Ant Design component overrides (BACKLOG §6): ключи — как в светлой
 */
function getDarkComponentOverrides(): ThemeConfig['components'] {
  return {
    "Menu": {
      "itemSelectedColor": "#e9edf2",
      "itemSelectedBg": "rgba(233,237,242,0.06)",
      "itemColor": "#b7b7ba",
      "itemBg": "#141b23",
      "itemHoverColor": "#e9edf2",
      "groupTitleColor": "#b7b7ba",
      "itemDisabledColor": "rgba(233,237,242,0.35)",
      "algorithm": true,
      "subMenuItemSelectedColor": "#e9edf2",
      "subMenuItemBg": "#1b2530"
    },
    "Steps": {},
    "Table": {
      "headerBg": "transparent",
      "headerColor": "#b7b7ba",
      "colorBgContainer": "transparent",
      "colorText": "#e9edf2",
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "borderColor": "rgba(233,237,242,0.14)",
      "rowHoverBg": "rgba(116,157,196,0.12)",
      "headerSplitColor": "transparent",
      "cellPaddingBlock": 12,
      "cellPaddingInline": 16,
      "headerSortActiveBg": "rgba(233,237,242,0.02)",
      "headerSortHoverBg": "rgba(233,237,242,0.04)",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "stickyScrollBarBg": "rgba(233,237,242,0.15)",
      "stickyScrollBarBorderRadius": 6,
      "fixedHeaderSortActiveBg": "rgba(233,237,242,0.02)",
      "bodySortBg": "transparent",
      "algorithm": true
    },
    "Input": {
      "colorBgContainer": "#1b2530",
      "colorBorder": "rgba(233,237,242,0.14)",
      "colorText": "#e9edf2",
      "colorTextPlaceholder": "#98989b",
      "activeBorderColor": "#749dc4",
      "activeShadow": "none",
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "colorBgContainerDisabled": "rgba(233,237,242,0.04)",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "algorithm": true
    },
    "List": {
      "itemPadding": "8px 0",
      "algorithm": true
    },
    "Typography": {
      "fontFamilyCode": "'JetBrains Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
      "titleMarginBottom": 0,
      "titleMarginTop": 0,
      "algorithm": true,
      "colorText": "#e9edf2",
      "colorTextHeading": "#e9edf2",
      "colorTextDescription": "#b7b7ba",
      "colorTextDisabled": "rgba(233,237,242,0.35)"
    },
    "Anchor": {
      "linkPaddingBlock": 10,
      "algorithm": true
    },
    "Button": {
      "primaryShadow": "none",
      "defaultShadow": "none",
      "dangerShadow": "none",
      "primaryColor": "#141b23",
      "colorPrimaryText": "#141b23",
      "defaultBg": "transparent",
      "defaultBorderColor": "rgba(233,237,242,0.14)",
      "defaultColor": "#e9edf2",
      "defaultHoverBg": "rgba(116,157,196,0.12)",
      "defaultHoverBorderColor": "#749dc4",
      "colorTextDisabled": "#e9edf2",
      "colorBgContainerDisabled": "transparent",
      "borderColorDisabled": "rgba(233,237,242,0.14)",
      "algorithm": true
    },
    "Switch": {
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "algorithm": true
    },
    "Checkbox": {
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "colorBgContainerDisabled": "rgba(233,237,242,0.04)",
      "algorithm": true
    },
    "Segmented": {
      "itemSelectedBg": "#749dc4",
      "itemSelectedColor": "#141b23",
      "trackBg": "transparent",
      "itemColor": "#e9edf2",
      "itemHoverBg": "rgba(116,157,196,0.12)",
      "controlPaddingHorizontal": 16,
      "algorithm": true,
      "trackPadding": 4
    },
    "Image": {
      "algorithm": true
    },
    "Tabs": {
      "itemColor": "#b7b7ba",
      "itemSelectedColor": "#749dc4",
      "itemHoverColor": "#94bce3",
      "inkBarColor": "#749dc4",
      "titleFontSize": 14,
      "cardBg": "transparent",
      "colorBorderSecondary": "rgba(233,237,242,0.14)",
      "algorithm": true
    },
    "Tag": {
      "defaultBg": "rgba(116,157,196,0.12)",
      "defaultColor": "#d6ebff",
      "colorBorder": "rgba(233,237,242,0.14)",
      "algorithm": true
    },
    "DatePicker": {
      "colorBgContainer": "#1b2530",
      "colorBorder": "rgba(233,237,242,0.14)",
      "colorText": "#e9edf2",
      "colorTextPlaceholder": "#98989b",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "activeBorderColor": "#749dc4",
      "activeShadow": "none",
      "colorBgElevated": "#141b23",
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "colorBgContainerDisabled": "rgba(233,237,242,0.04)",
      "algorithm": true
    },
    "Select": {
      "colorBgContainer": "#1b2530",
      "colorBorder": "rgba(233,237,242,0.14)",
      "colorText": "#e9edf2",
      "colorTextPlaceholder": "#98989b",
      "activeBorderColor": "#749dc4",
      "activeOutlineColor": "transparent",
      "colorBgElevated": "#141b23",
      "optionSelectedBg": "rgba(116,157,196,0.12)",
      "optionActiveBg": "rgba(116,157,196,0.12)",
      "optionSelectedColor": "#e9edf2",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "colorPrimary": "#e9edf2",
      "selectorBg": "#1b2530",
      "controlItemBgHover": "rgba(116,157,196,0.12)",
      "boxShadowSecondary": "0 12px 32px rgba(0,0,0,0.5)",
      "multipleItemBg": "#1b2530",
      "multipleItemBorderColor": "transparent",
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "colorBgContainerDisabled": "rgba(233,237,242,0.04)",
      "clearBg": "#1b2530",
      "algorithm": true
    },
    "InputNumber": {
      "colorBgContainer": "#1b2530",
      "colorBorder": "rgba(233,237,242,0.14)",
      "colorText": "#e9edf2",
      "colorTextPlaceholder": "#98989b",
      "activeBorderColor": "#749dc4",
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "colorBgContainerDisabled": "rgba(233,237,242,0.04)",
      "handleBorderColor": "rgba(233,237,242,0.14)",
      "handleHoverColor": "#e9edf2",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "algorithm": true
    },
    "Form": {
      "margin": 0,
      "verticalLabelPadding": 0,
      "labelColor": "#b7b7ba",
      "labelFontSize": 12,
      "itemMarginBottom": 16,
      "colorTextDisabled": "rgba(233,237,242,0.35)"
    },
    "Cascader": {
      "colorBgContainer": "#1b2530",
      "colorBorder": "rgba(233,237,242,0.14)",
      "colorText": "#e9edf2",
      "colorTextPlaceholder": "#98989b",
      "colorBgElevated": "#141b23",
      "optionSelectedBg": "rgba(116,157,196,0.12)",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "algorithm": true
    },
    "TreeSelect": {
      "colorBgContainer": "#1b2530",
      "colorBorder": "rgba(233,237,242,0.14)",
      "colorText": "#e9edf2",
      "colorTextPlaceholder": "#98989b",
      "colorBgElevated": "#141b23",
      "nodeSelectedBg": "rgba(116,157,196,0.12)",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "algorithm": true
    },
    "Radio": {
      "colorText": "#e9edf2",
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "colorBgContainerDisabled": "rgba(233,237,242,0.04)",
      "buttonSolidCheckedBg": "#e9edf2",
      "buttonSolidCheckedColor": "#141b23",
      "algorithm": true
    },
    "Alert": {
      "colorInfoBg": "#1b2530"
    },
    "Tooltip": {
      "colorBgSpotlight": "#1b2530",
      "colorTextLightSolid": "#e9edf2"
    },
    "Popover": {
      "colorBgElevated": "#1b2530",
      "colorText": "#e9edf2",
      "colorTextHeading": "#e9edf2"
    },
    "Pagination": {
      "itemBg": "transparent",
      "itemActiveBg": "#e9edf2",
      "itemActiveColor": "#141b23",
      "itemActiveColorHover": "#141b23",
      "colorText": "#e9edf2",
      "colorTextDisabled": "rgba(233,237,242,0.35)",
      "colorBorder": "rgba(233,237,242,0.15)",
      "algorithm": true
    },
    "Empty": {
      "colorText": "#98989b",
      "colorTextBase": "#98989b",
      "colorTextDescription": "#98989b",
      "algorithm": true
    },
    "Collapse": {
      "colorBgContainer": "transparent",
      "colorBorder": "rgba(233,237,242,0.06)",
      "contentBg": "transparent",
      "headerBg": "transparent",
      "colorText": "#e9edf2",
      "colorTextHeading": "#e9edf2",
      "algorithm": true
    },
    "Modal": {
      "contentBg": "#141b23",
      "headerBg": "#141b23",
      "titleColor": "#e9edf2",
      "colorText": "#e9edf2",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "colorBgElevated": "#141b23",
      "colorBgMask": "rgba(233,237,242,0.6)",
      "boxShadow": "0 12px 32px rgba(0,0,0,0.5)",
      "algorithm": true
    },
    "Drawer": {
      "colorBgElevated": "#1b2530",
      "colorText": "#e9edf2",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "colorSplit": "rgba(233,237,242,0.06)",
      "algorithm": true
    },
    "Breadcrumb": {
      "separatorColor": "#98989b",
      "itemColor": "#98989b",
      "linkColor": "#98989b",
      "linkHoverColor": "#e9edf2",
      "algorithm": true
    },
    "Card": {
      "colorBgContainer": "#1b2530",
      "colorBorderSecondary": "rgba(233,237,242,0.06)",
      "colorText": "#e9edf2",
      "colorTextHeading": "#e9edf2",
      "colorTextDescription": "#b7b7ba",
      "headerBg": "#1b2530",
      "algorithm": true
    },
    "Progress": {
      "defaultColor": "#749dc4",
      "remainingColor": "rgba(233,237,242,0.06)",
      "algorithm": true
    },
    "Descriptions": {
      "colorBgContainer": "transparent",
      "colorText": "#e9edf2",
      "colorTextLabel": "#b7b7ba",
      "colorTextSecondary": "#b7b7ba",
      "colorSplit": "rgba(233,237,242,0.06)",
      "labelBg": "rgba(233,237,242,0.02)",
      "algorithm": true
    },
    "Notification": {
      "colorBgElevated": "#1b2530",
      "colorText": "#e9edf2",
      "colorTextHeading": "#e9edf2",
      "colorIcon": "#98989b",
      "colorIconHover": "#e9edf2",
      "colorInfoBg": "#1b2530",
      "colorSuccessBg": "#1b2530",
      "colorWarningBg": "#1b2530",
      "colorErrorBg": "#1b2530",
      "algorithm": true
    },
    "Message": {
      "contentBg": "#1b2530",
      "colorText": "#e9edf2",
      "colorError": "#eb5151",
      "colorSuccess": "#69bb80",
      "colorWarning": "#f57834",
      "colorInfo": "#e9edf2",
      "algorithm": true
    },
    "Dropdown": {
      "colorText": "#e9edf2",
      "colorBgElevated": "#141b23",
      "controlItemBgHover": "rgba(116,157,196,0.12)",
      "controlItemBgActive": "rgba(116,157,196,0.24)",
      "colorSplit": "rgba(233,237,242,0.14)",
      "boxShadowSecondary": "0 12px 32px rgba(0,0,0,0.5)"
    },
  };
}

/**
 * Light theme Ant Design component overrides
 */
function getLightComponentOverrides(): ThemeConfig['components'] {
  return {
    "Menu": {
      "itemSelectedColor": "rgb(26,26,26)",
      "itemSelectedBg": "rgba(0,0,0,0.06)",
      "itemColor": "rgb(102,102,102)",
      "itemBg": "#F5F5F5",
      "itemHoverColor": "rgb(26,26,26)",
      "groupTitleColor": "rgb(102,102,102)",
      "itemDisabledColor": "rgba(0,0,0,0.25)",
      "algorithm": true,
      "subMenuItemSelectedColor": "rgb(26,26,26)",
      "subMenuItemBg": "#FAFAFA"
    },
    "Steps": {},
    "Table": {
      "headerBg": "transparent",
      "headerColor": "#5d5d60",
      "colorBgContainer": "transparent",
      "colorText": "#1d1f20",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "borderColor": "rgba(29,31,32,0.16)",
      "rowHoverBg": "#eef6ff",
      "headerSplitColor": "transparent",
      "cellPaddingBlock": 12,
      "cellPaddingInline": 16,
      "headerSortActiveBg": "rgba(0,0,0,0.02)",
      "headerSortHoverBg": "rgba(0,0,0,0.04)",
      "colorIcon": "#7a7a7d",
      "colorIconHover": "#1d1f20",
      "stickyScrollBarBg": "rgba(0,0,0,0.15)",
      "stickyScrollBarBorderRadius": 6,
      "fixedHeaderSortActiveBg": "rgba(0,0,0,0.02)",
      "bodySortBg": "transparent",
      "algorithm": true
    },
    "Input": {
      "colorBgContainer": "#e9e9ea",
      "colorBorder": "rgba(29,31,32,0.16)",
      "colorText": "#1d1f20",
      "colorTextPlaceholder": "#7a7a7d",
      "activeBorderColor": "#5980a6",
      "activeShadow": "none",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "colorIcon": "#7a7a7d",
      "colorIconHover": "#1d1f20",
      "algorithm": true
    },
    "List": {
      "itemPadding": "8px 0",
      "algorithm": true
    },
    "Typography": {
      "fontFamilyCode": "'JetBrains Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
      "titleMarginBottom": 0,
      "titleMarginTop": 0,
      "algorithm": true,
      "colorText": "rgb(26,26,26)",
      "colorTextHeading": "rgb(26,26,26)",
      "colorTextDescription": "rgb(102,102,102)",
      "colorTextDisabled": "rgba(0,0,0,0.25)"
    },
    "Anchor": {
      "linkPaddingBlock": 10,
      "algorithm": true
    },
    "Button": {
      "primaryShadow": "none",
      "defaultShadow": "none",
      "dangerShadow": "none",
      "primaryColor": "#ffffff",
      "colorPrimaryText": "#ffffff",
      "defaultBg": "transparent",
      "defaultBorderColor": "rgba(29,31,32,0.16)",
      "defaultColor": "#1d1f20",
      "defaultHoverBg": "#eef6ff",
      "defaultHoverBorderColor": "#5980a6",
      "colorTextDisabled": "#1d1f20",
      "colorBgContainerDisabled": "transparent",
      "borderColorDisabled": "rgba(29,31,32,0.16)",
      "algorithm": true
    },
    "Switch": {
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "algorithm": true
    },
    "Checkbox": {
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "algorithm": true
    },
    "Segmented": {
      "itemSelectedBg": "#5980a6",
      "itemSelectedColor": "#f2f2f3",
      "trackBg": "transparent",
      "itemColor": "#1d1f20",
      "itemHoverBg": "#eef6ff",
      "controlPaddingHorizontal": 16,
      "algorithm": true,
      "trackPadding": 4
    },
    "Image": {
      "algorithm": true
    },
    "Tabs": {
      "itemColor": "#5d5d60",
      "itemSelectedColor": "#5980a6",
      "itemHoverColor": "#597ea3",
      "inkBarColor": "#5980a6",
      "titleFontSize": 14,
      "cardBg": "transparent",
      "colorBorderSecondary": "rgba(29,31,32,0.16)",
      "algorithm": true
    },
    "Tag": {
      "defaultBg": "#eef6ff",
      "defaultColor": "#2c455d",
      "colorBorder": "rgba(29,31,32,0.16)",
      "algorithm": true
    },
    "DatePicker": {
      "colorBgContainer": "#e9e9ea",
      "colorBorder": "rgba(29,31,32,0.16)",
      "colorText": "#1d1f20",
      "colorTextPlaceholder": "#7a7a7d",
      "colorIcon": "#7a7a7d",
      "colorIconHover": "#1d1f20",
      "activeBorderColor": "#5980a6",
      "activeShadow": "none",
      "colorBgElevated": "#f2f2f3",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "algorithm": true
    },
    "Select": {
      "colorBgContainer": "#e9e9ea",
      "colorBorder": "rgba(29,31,32,0.16)",
      "colorText": "#1d1f20",
      "colorTextPlaceholder": "#7a7a7d",
      "activeBorderColor": "#5980a6",
      "activeOutlineColor": "transparent",
      "colorBgElevated": "#f2f2f3",
      "optionSelectedBg": "#eef6ff",
      "optionActiveBg": "#eef6ff",
      "optionSelectedColor": "#1d1f20",
      "colorIcon": "#7a7a7d",
      "colorIconHover": "#1d1f20",
      "colorPrimary": "#1d1f20",
      "selectorBg": "#e9e9ea",
      "controlItemBgHover": "#eef6ff",
      "boxShadowSecondary": "0 12px 32px rgba(43,43,45,0.22)",
      "multipleItemBg": "#F0F0F0",
      "multipleItemBorderColor": "transparent",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "clearBg": "#F0F0F0",
      "algorithm": true
    },
    "InputNumber": {
      "colorBgContainer": "#e9e9ea",
      "colorBorder": "rgba(29,31,32,0.16)",
      "colorText": "#1d1f20",
      "colorTextPlaceholder": "#7a7a7d",
      "activeBorderColor": "#5980a6",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "handleBorderColor": "rgba(29,31,32,0.16)",
      "handleHoverColor": "#1d1f20",
      "colorIcon": "#7a7a7d",
      "colorIconHover": "#1d1f20",
      "algorithm": true
    },
    "Form": {
      "margin": 0,
      "verticalLabelPadding": 0,
      "labelColor": "rgb(102,102,102)",
      "labelFontSize": 12,
      "itemMarginBottom": 16,
      "colorTextDisabled": "rgba(0,0,0,0.25)"
    },
    "Cascader": {
      "colorBgContainer": "#e9e9ea",
      "colorBorder": "rgba(29,31,32,0.16)",
      "colorText": "#1d1f20",
      "colorTextPlaceholder": "#7a7a7d",
      "colorBgElevated": "#f2f2f3",
      "optionSelectedBg": "#eef6ff",
      "colorIcon": "#7a7a7d",
      "colorIconHover": "#1d1f20",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "algorithm": true
    },
    "TreeSelect": {
      "colorBgContainer": "#e9e9ea",
      "colorBorder": "rgba(29,31,32,0.16)",
      "colorText": "#1d1f20",
      "colorTextPlaceholder": "#7a7a7d",
      "colorBgElevated": "#f2f2f3",
      "nodeSelectedBg": "#eef6ff",
      "colorIcon": "#7a7a7d",
      "colorIconHover": "#1d1f20",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "algorithm": true
    },
    "Radio": {
      "colorText": "rgb(26,26,26)",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "buttonSolidCheckedBg": "rgb(26,26,26)",
      "buttonSolidCheckedColor": "rgb(255,255,255)",
      "algorithm": true
    },
    "Alert": {
      "colorInfoBg": "#F0F0F0"
    },
    "Tooltip": {
      "colorBgSpotlight": "rgb(38,38,38)"
    },
    "Popover": {
      "colorBgElevated": "#FFFFFF",
      "colorText": "rgb(26,26,26)",
      "colorTextHeading": "rgb(26,26,26)"
    },
    "Pagination": {
      "itemBg": "transparent",
      "itemActiveBg": "rgb(26,26,26)",
      "itemActiveColor": "rgb(255,255,255)",
      "itemActiveColorHover": "rgb(255,255,255)",
      "colorText": "rgb(26,26,26)",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBorder": "rgba(0,0,0,0.15)",
      "algorithm": true
    },
    "Empty": {
      "colorText": "rgb(140,140,140)",
      "colorTextBase": "rgb(140,140,140)",
      "colorTextDescription": "rgb(140,140,140)",
      "algorithm": true
    },
    "Collapse": {
      "colorBgContainer": "transparent",
      "colorBorder": "rgba(0,0,0,0.06)",
      "contentBg": "transparent",
      "headerBg": "transparent",
      "colorText": "rgb(26,26,26)",
      "colorTextHeading": "rgb(26,26,26)",
      "algorithm": true
    },
    "Modal": {
      "contentBg": "#f2f2f3",
      "headerBg": "#f2f2f3",
      "titleColor": "#1d1f20",
      "colorText": "#1d1f20",
      "colorIcon": "#7a7a7d",
      "colorIconHover": "#1d1f20",
      "colorBgElevated": "#f2f2f3",
      "colorBgMask": "rgba(0,0,0,0.45)",
      "boxShadow": "0 12px 32px rgba(43,43,45,0.22)",
      "algorithm": true
    },
    "Drawer": {
      "colorBgElevated": "#FFFFFF",
      "colorText": "rgb(26,26,26)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
      "colorSplit": "rgba(0,0,0,0.06)",
      "algorithm": true
    },
    "Breadcrumb": {
      "separatorColor": "rgb(140,140,140)",
      "itemColor": "rgb(140,140,140)",
      "linkColor": "rgb(140,140,140)",
      "linkHoverColor": "rgb(26,26,26)",
      "algorithm": true
    },
    "Card": {
      "colorBgContainer": "#FFFFFF",
      "colorBorderSecondary": "rgba(0,0,0,0.06)",
      "colorText": "rgb(26,26,26)",
      "colorTextHeading": "rgb(26,26,26)",
      "colorTextDescription": "rgb(102,102,102)",
      "headerBg": "#FFFFFF",
      "algorithm": true
    },
    "Progress": {
      "defaultColor": "#4255FF",
      "remainingColor": "rgba(0,0,0,0.06)",
      "algorithm": true
    },
    "Descriptions": {
      "colorBgContainer": "transparent",
      "colorText": "rgb(26,26,26)",
      "colorTextLabel": "rgb(102,102,102)",
      "colorTextSecondary": "rgb(102,102,102)",
      "colorSplit": "rgba(0,0,0,0.06)",
      "labelBg": "rgba(0,0,0,0.02)",
      "algorithm": true
    },
    "Notification": {
      "colorBgElevated": "#FFFFFF",
      "colorText": "rgb(26,26,26)",
      "colorTextHeading": "rgb(26,26,26)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
      "colorInfoBg": "#FFFFFF",
      "colorSuccessBg": "#FFFFFF",
      "colorWarningBg": "#FFFFFF",
      "colorErrorBg": "#FFFFFF",
      "algorithm": true
    },
    "Message": {
      "contentBg": "#FFFFFF",
      "colorText": "rgb(26,26,26)",
      "colorError": "#eb5151",
      "colorSuccess": "#69bb80",
      "colorWarning": "#f57834",
      "colorInfo": "rgb(26,26,26)",
      "algorithm": true
    },
    "Dropdown": {
      "colorText": "#1d1f20",
      "colorBgElevated": "#f2f2f3",
      "controlItemBgHover": "#eef6ff",
      "controlItemBgActive": "#d6ebff",
      "colorSplit": "rgba(29,31,32,0.16)",
      "boxShadowSecondary": "0 12px 32px rgba(43,43,45,0.22)"
    },
  };
}

const componentOverrides: Record<Theme, ThemeConfig['components']> = {
  [Theme.DARK]: getDarkComponentOverrides(),
  [Theme.LIGHT]: getLightComponentOverrides(),
};

export const themeConfig = (currentTheme: Theme): ThemeConfig => {
  parseTokensToCss(themeTokens[currentTheme]);
  setGlobalCssVariables(currentTheme);

  return {
    token: themeTokens[currentTheme],
    components: componentOverrides[currentTheme],
  };
};
