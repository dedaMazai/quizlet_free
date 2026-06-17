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
    '--scroll-bard-border': '#666666',
    '--scroll-bard': 'rgba(255, 255, 255, 0.15)',
    '--text': '#ffffff',
    '--text-secondary': '#A0A0A0',
    '--bg-color': '#141419',
    '--bg-color-secondary': '#1C1C22',
    '--inverted-bg-color': '#fff',
    '--help-button-bg': '#333333',
    '--field-border': 'rgba(255, 255, 255, 0.16)',
    '--card-bg': 'rgba(255, 255, 255, 0.03)',
    '--card-bg-secondary': '#26262E',

    // Brand accent (indigo) + elevation
    '--color-accent': '#5B6BFF',
    '--color-accent-hover': '#6E7CFF',
    '--color-accent-soft': 'rgba(91, 107, 255, 0.18)',
    '--color-success-soft': 'rgba(105, 187, 128, 0.18)',
    '--color-error-soft': 'rgba(235, 81, 81, 0.18)',
    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
    '--shadow-md': '0 6px 20px rgba(0, 0, 0, 0.45)',
    '--shadow-card-hover': '0 10px 28px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(91, 107, 255, 0.4)',

    // Borders
    '--border-subtle': 'rgba(255, 255, 255, 0.1)',
    '--border-light': 'rgba(255, 255, 255, 0.15)',
    '--border-medium': 'rgba(255, 255, 255, 0.2)',
    '--border-accent': 'rgba(255, 255, 255, 0.3)',
    '--color-border': 'rgba(255, 255, 255, 0.1)',

    // Primary
    '--color-primary-rgb': '14, 14, 14',
    '--color-primary-bg-hover': 'rgba(255, 255, 255, 0.08)',

    // Interactive states
    '--hover-bg': 'rgba(255, 255, 255, 0.08)',
    '--active-bg': 'rgba(255, 255, 255, 0.12)',
    '--hover-bg-light': 'rgba(255, 255, 255, 0.05)',

    // Form fields
    '--field-bg': '#252525',
    '--field-label-color': '#A0A0A0',

    // Overlay
    '--overlay-color': 'rgba(0, 0, 0, 0.6)',

    // Semantic colors
    '--color-accent-blue': '#5B6BFF',
    '--color-star': '#fadb14',
    '--color-logo': '#EFEDE7',
    '--code-bg': '#1a1b26',
    '--inline-code-bg': 'rgba(255, 255, 255, 0.1)',
    '--inline-code-border': 'rgba(255, 255, 255, 0.15)',
    '--inline-code-color': '#e06c75',
    '--code-line-number': '#636d83',
    '--code-border': 'rgba(255, 255, 255, 0.08)',
    // Syntax token colors (dark - Tokyo Night inspired)
    '--code-keyword': '#bb9af7',
    '--code-string': '#9ece6a',
    '--code-comment': '#565f89',
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
    '--selection-bg': 'rgba(255, 255, 255, 0.2)',
    '--selection-color': '#ffffff',
    '--color-icon-secondary': '#A0A0A0',
    '--color-elevated-bg': '#222222',
    '--color-spotlight-bg': '#333333',

    // Editor highlights
    '--highlight-yellow': '#fef08a',
    '--highlight-green': '#bbf7d0',
    '--highlight-blue': '#bfdbfe',
    '--highlight-pink': '#fbcfe8',
    '--highlight-orange': '#fed7aa',
    '--highlight-purple': '#ddd6fe',

    // Disabled primary button
    '--btn-primary-disabled-color': 'rgba(255, 255, 255, 0.45)',
    '--btn-primary-disabled-bg': 'rgba(255, 255, 255, 0.08)',
    '--btn-primary-disabled-border': 'rgba(255, 255, 255, 0.16)',
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
    '--color-accent': '#4255FF',
    '--color-accent-hover': '#3646E6',
    '--color-accent-soft': '#EEF0FF',
    '--color-success-soft': 'rgba(105, 187, 128, 0.14)',
    '--color-error-soft': 'rgba(235, 81, 81, 0.12)',
    '--shadow-sm': '0 1px 2px rgba(16, 24, 40, 0.06)',
    '--shadow-md': '0 4px 16px rgba(16, 24, 40, 0.08)',
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
    '--btn-primary-disabled-color': 'rgba(0, 0, 0, 0.35)',
    '--btn-primary-disabled-bg': 'rgba(0, 0, 0, 0.08)',
    '--btn-primary-disabled-border': 'rgba(0, 0, 0, 0.2)',
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
 * Dark theme Ant Design component overrides (improved readability)
 */
function getDarkComponentOverrides(): ThemeConfig['components'] {
  return {
    "Menu": {
      "itemSelectedColor": "rgb(255,255,255)",
      "itemSelectedBg": "rgb(51,51,51)",
      "itemColor": "rgb(160,160,160)",
      "itemBg": "rgb(20,20,20)",
      "itemHoverColor": "rgba(255,255,255,0.88)",
      "groupTitleColor": "rgb(160,160,160)",
      "itemDisabledColor": "rgb(80,80,80)",
      "algorithm": true,
      "subMenuItemSelectedColor": "rgb(160,160,160)",
      "subMenuItemBg": "rgb(24,24,24)"
    },
    "Steps": {},
    "Table": {
      "headerBg": "transparent",
      "headerColor": "rgb(160,160,160)",
      "colorBgContainer": "transparent",
      "colorText": "rgb(255,255,255)",
      "colorTextDisabled": "rgb(180,180,180)",
      "borderColor": "rgba(255,255,255,0.08)",
      "rowHoverBg": "rgba(255,255,255,0.04)",
      "headerSplitColor": "transparent",
      "cellPaddingBlock": 12,
      "cellPaddingInline": 16,
      "headerSortActiveBg": "rgba(255,255,255,0.04)",
      "headerSortHoverBg": "rgba(255,255,255,0.08)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "stickyScrollBarBg": "rgba(255,255,255,0.15)",
      "stickyScrollBarBorderRadius": 6,
      "fixedHeaderSortActiveBg": "rgba(255,255,255,0.04)",
      "bodySortBg": "transparent",
      "algorithm": true
    },
    "Input": {
      "colorBgContainer": "#222222",
      "colorBorder": "rgba(255,255,255,0.16)",
      "colorText": "rgb(255,255,255)",
      "colorTextPlaceholder": "rgb(160,160,160)",
      "borderRadius": 8,
      "activeBorderColor": "rgba(255,255,255,0.32)",
      "hoverBorderColor": "rgba(255,255,255,0.24)",
      "activeShadow": "none",
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "colorBgContainerDisabled": "rgba(255,255,255,0.08)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "algorithm": true
    },
    "List": {
      "itemPadding": "8px 0",
      "algorithm": true
    },
    "Typography": {
      "fontFamilyCode": "OpenSans, Consolas, 'Liberation Mono', Menlo, Courier, monospace",
      "titleMarginBottom": 0,
      "titleMarginTop": 0,
      "algorithm": true,
      "colorText": "rgb(255,255,255)",
      "colorTextHeading": "rgb(255,255,255)",
      "colorTextDescription": "rgb(160,160,160)",
      "colorTextDisabled": "rgba(160,160,160,0.75)"
    },
    "Anchor": {
      "linkPaddingBlock": 10,
      "algorithm": true
    },
    "Button": {
      "primaryShadow": "none",
      "primaryColor": "#ffffff",
      "colorPrimaryText": "#ffffff",
      // "defaultColor": "rgb(255,255,255)",
      // "defaultBg": "rgba(255,255,255,0.08)",
      // "defaultBorderColor": "rgba(255,255,255,0.16)",
      // "defaultHoverColor": "rgb(255,255,255)",
      // "defaultHoverBg": "rgba(255,255,255,0.12)",
      // "defaultHoverBorderColor": "rgba(255,255,255,0.24)",
      // "defaultActiveColor": "rgb(255,255,255)",
      // "defaultActiveBg": "rgba(255,255,255,0.16)",
      // "defaultActiveBorderColor": "rgba(255,255,255,0.3)",
      // "defaultGhostColor": "rgb(255,255,255)",
      // "defaultGhostBorderColor": "rgba(255,255,255,0.24)",
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "colorBgContainerDisabled": "rgba(255,255,255,0.08)",
      "borderColorDisabled": "rgba(255,255,255,0.16)",
      "algorithm": true
    },
    "Switch": {
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "algorithm": true
    },
    "Checkbox": {
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "colorBgContainerDisabled": "rgba(255,255,255,0.08)",
      "algorithm": true
    },
    "Segmented": {
      "itemSelectedBg": "#333333",
      "colorText": "rgb(255,255,255)",
      "trackBg": "#222222",
      "itemColor": "rgb(255,255,255)",
      "controlPaddingHorizontal": 16,
      "algorithm": true,
      "trackPadding": 4
    },
    "Image": {
      "algorithm": true
    },
    "Tabs": {
      "itemColor": "rgb(160,160,160)",
      "itemSelectedColor": "rgb(255,255,255)",
      "itemHoverColor": "rgb(255,255,255)",
      "inkBarColor": "rgb(255,255,255)",
      "titleFontSize": 14,
      "cardBg": "transparent",
      "colorBorderSecondary": "rgba(255,255,255,0.1)",
      "algorithm": true
    },
    "Tag": {
      "colorBgBase": "#333333",
      "algorithm": true
    },
    "DatePicker": {
      "colorBgContainer": "#222222",
      "colorBorder": "rgba(255,255,255,0.16)",
      "colorText": "rgb(255,255,255)",
      "colorTextPlaceholder": "rgb(160,160,160)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "borderRadius": 8,
      "activeBorderColor": "rgba(255,255,255,0.32)",
      "hoverBorderColor": "rgba(255,255,255,0.24)",
      "activeShadow": "none",
      "colorBgElevated": "rgb(34,34,34)",
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "colorBgContainerDisabled": "rgba(255,255,255,0.08)",
      "algorithm": true
    },
    "Select": {
      "colorBgContainer": "#222222",
      "colorBorder": "rgba(255,255,255,0.16)",
      "colorText": "rgb(255,255,255)",
      "colorTextPlaceholder": "rgb(160,160,160)",
      "borderRadius": 8,
      "activeBorderColor": "rgba(255,255,255,0.32)",
      "hoverBorderColor": "rgba(255,255,255,0.24)",
      "activeOutlineColor": "transparent",
      "colorBgElevated": "rgb(34,34,34)",
      "optionSelectedBg": "rgb(51,51,51)",
      "optionActiveBg": "rgb(44,44,44)",
      "optionSelectedColor": "rgb(255,255,255)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "colorPrimary": "rgb(255,255,255)",
      "selectorBg": "#222222",
      "controlItemBgHover": "rgb(44,44,44)",
      "boxShadowSecondary": "0 6px 16px 0 rgba(0, 0, 0, 0.3)",
      "multipleItemBg": "rgb(51,51,51)",
      "multipleItemBorderColor": "transparent",
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "colorBgContainerDisabled": "rgba(255,255,255,0.08)",
      "clearBg": "rgb(51,51,51)",
      "algorithm": true
    },
    "InputNumber": {
      "colorBgContainer": "#222222",
      "colorBorder": "rgba(255,255,255,0.16)",
      "colorText": "rgb(255,255,255)",
      "colorTextPlaceholder": "rgb(160,160,160)",
      "borderRadius": 8,
      "activeBorderColor": "rgba(255,255,255,0.32)",
      "hoverBorderColor": "rgba(255,255,255,0.24)",
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "colorBgContainerDisabled": "rgba(255,255,255,0.08)",
      "handleBorderColor": "rgba(255,255,255,0.16)",
      "handleHoverColor": "rgb(255,255,255)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "algorithm": true
    },
    "Form": {
      "margin": 0,
      "verticalLabelPadding": 0,
      "labelColor": "rgb(160,160,160)",
      "labelFontSize": 12,
      "itemMarginBottom": 16,
      "colorTextDisabled": "rgba(255,255,255,0.45)"
    },
    "Cascader": {
      "colorBgContainer": "#222222",
      "colorBorder": "rgba(255,255,255,0.16)",
      "colorText": "rgb(255,255,255)",
      "colorTextPlaceholder": "rgb(160,160,160)",
      "borderRadius": 8,
      "colorBgElevated": "rgb(34,34,34)",
      "optionSelectedBg": "rgb(51,51,51)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "algorithm": true
    },
    "TreeSelect": {
      "colorBgContainer": "#222222",
      "colorBorder": "rgba(255,255,255,0.16)",
      "colorText": "rgb(255,255,255)",
      "colorTextPlaceholder": "rgb(160,160,160)",
      "borderRadius": 8,
      "colorBgElevated": "rgb(34,34,34)",
      "nodeSelectedBg": "rgb(51,51,51)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "algorithm": true
    },
    "Radio": {
      "colorText": "rgb(255,255,255)",
      "colorTextDisabled": "rgba(255,255,255,0.45)",
      "colorBgContainerDisabled": "rgba(255,255,255,0.08)",
      "buttonSolidCheckedBg": "rgb(255,255,255)",
      "buttonSolidCheckedColor": "rgb(0,0,0)",
      "algorithm": true
    },
    "Alert": {
      "colorInfoBg": "rgb(34,34,34)",
      "colorText": "rgb(255,255,255)",
      "colorTextHeading": "rgb(255,255,255)"
    },
    "Tooltip": {
      "colorBgSpotlight": "rgb(51,51,51)"
    },
    "Popover": {
      "colorBgElevated": "rgb(51,51,51)",
      "colorText": "rgb(255,255,255)",
      "colorTextHeading": "rgb(255,255,255)"
    },
    "Pagination": {
      "itemBg": "transparent",
      "itemActiveBg": "rgb(255,255,255)",
      "itemActiveColor": "rgb(0,0,0)",
      "itemActiveColorHover": "rgb(0,0,0)",
      "colorText": "rgb(255,255,255)",
      "colorTextDisabled": "rgb(160,160,160)",
      "colorBorder": "rgba(255,255,255,0.16)",
      "borderRadius": 8,
      "algorithm": true
    },
    "Empty": {
      "colorText": "rgb(180,180,180)",
      "colorTextBase": "rgb(180,180,180)",
      "colorTextDescription": "rgb(180,180,180)",
      "algorithm": true
    },
    "Collapse": {
      "colorBgContainer": "transparent",
      "colorBorder": "rgba(255,255,255,0.1)",
      "contentBg": "transparent",
      "headerBg": "transparent",
      "colorText": "rgb(255,255,255)",
      "colorTextHeading": "rgb(255,255,255)",
      "algorithm": true
    },
    "Modal": {
      "contentBg": "rgb(34,34,34)",
      "headerBg": "rgb(34,34,34)",
      "titleColor": "rgb(255,255,255)",
      "colorText": "rgb(255,255,255)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "colorBgElevated": "rgb(34,34,34)",
      "colorBgMask": "rgba(0,0,0,0.65)",
      "algorithm": true
    },
    "Drawer": {
      "colorBgElevated": "rgb(34,34,34)",
      "colorText": "rgb(255,255,255)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "colorSplit": "rgba(255,255,255,0.1)",
      "algorithm": true
    },
    "Breadcrumb": {
      "separatorColor": "rgb(160,160,160)",
      "itemColor": "rgb(160,160,160)",
      "linkColor": "rgb(160,160,160)",
      "linkHoverColor": "rgb(255,255,255)",
      "algorithm": true
    },
    "Card": {
      "colorBgContainer": "rgb(38,38,46)",
      "colorBorderSecondary": "rgba(255,255,255,0.08)",
      "colorText": "rgb(255,255,255)",
      "colorTextHeading": "rgb(255,255,255)",
      "colorTextDescription": "rgb(160,160,160)",
      "headerBg": "rgb(38,38,46)",
      "borderRadiusLG": 16,
      "algorithm": true
    },
    "Progress": {
      "defaultColor": "#5B6BFF",
      "remainingColor": "rgba(255,255,255,0.12)",
      "algorithm": true
    },
    "Descriptions": {
      "colorBgContainer": "transparent",
      "colorText": "rgb(255,255,255)",
      "colorTextLabel": "rgb(160,160,160)",
      "colorTextSecondary": "rgb(160,160,160)",
      "colorSplit": "rgba(255,255,255,0.1)",
      "labelBg": "rgba(255,255,255,0.04)",
      "algorithm": true
    },
    "Notification": {
      "colorBgElevated": "rgb(34,34,34)",
      "colorText": "rgb(255,255,255)",
      "colorTextHeading": "rgb(255,255,255)",
      "colorIcon": "rgb(160,160,160)",
      "colorIconHover": "rgb(255,255,255)",
      "colorInfoBg": "rgb(34,34,34)",
      "colorSuccessBg": "rgb(34,34,34)",
      "colorWarningBg": "rgb(34,34,34)",
      "colorErrorBg": "rgb(34,34,34)",
      "algorithm": true
    },
    "Message": {
      "contentBg": "rgb(34,34,34)",
      "colorText": "rgb(255,255,255)",
      "colorError": "#eb5151",
      "colorSuccess": "#69bb80",
      "colorWarning": "#f57834",
      "colorInfo": "rgb(255,255,255)",
      "algorithm": true
    },
    "Dropdown": {
      "colorText": "rgb(255,255,255)",
      "colorBgElevated": "rgb(34,34,34)",
      "controlItemBgHover": "rgba(255,255,255,0.08)",
      "controlItemBgActive": "rgba(255,255,255,0.12)",
      "colorSplit": "rgba(255,255,255,0.1)"
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
      "headerColor": "rgb(102,102,102)",
      "colorBgContainer": "transparent",
      "colorText": "rgb(26,26,26)",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "borderColor": "rgba(0,0,0,0.06)",
      "rowHoverBg": "rgba(0,0,0,0.02)",
      "headerSplitColor": "transparent",
      "cellPaddingBlock": 12,
      "cellPaddingInline": 16,
      "headerSortActiveBg": "rgba(0,0,0,0.02)",
      "headerSortHoverBg": "rgba(0,0,0,0.04)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
      "stickyScrollBarBg": "rgba(0,0,0,0.15)",
      "stickyScrollBarBorderRadius": 6,
      "fixedHeaderSortActiveBg": "rgba(0,0,0,0.02)",
      "bodySortBg": "transparent",
      "algorithm": true
    },
    "Input": {
      "colorBgContainer": "#FFFFFF",
      "colorBorder": "rgba(0,0,0,0.15)",
      "colorText": "rgb(26,26,26)",
      "colorTextPlaceholder": "rgb(140,140,140)",
      "borderRadius": 8,
      "activeBorderColor": "rgba(0,0,0,0.4)",
      "hoverBorderColor": "rgba(0,0,0,0.3)",
      "activeShadow": "none",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
      "algorithm": true
    },
    "List": {
      "itemPadding": "8px 0",
      "algorithm": true
    },
    "Typography": {
      "fontFamilyCode": "OpenSans, Consolas, 'Liberation Mono', Menlo, Courier, monospace",
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
      "primaryColor": "#ffffff",
      "colorPrimaryText": "#ffffff",
      "colorTextDisabled": "rgba(0,0,0,0.35)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.08)",
      "borderColorDisabled": "rgba(0,0,0,0.2)",
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
      "itemSelectedBg": "#FFFFFF",
      "colorText": "rgb(26,26,26)",
      "trackBg": "#F0F0F0",
      "itemColor": "rgb(26,26,26)",
      "controlPaddingHorizontal": 16,
      "algorithm": true,
      "trackPadding": 4
    },
    "Image": {
      "algorithm": true
    },
    "Tabs": {
      "itemColor": "rgb(102,102,102)",
      "itemSelectedColor": "rgb(26,26,26)",
      "itemHoverColor": "rgb(26,26,26)",
      "inkBarColor": "rgb(26,26,26)",
      "titleFontSize": 14,
      "cardBg": "transparent",
      "colorBorderSecondary": "rgba(0,0,0,0.06)",
      "algorithm": true
    },
    "Tag": {
      "colorBgBase": "#F0F0F0",
      "algorithm": true
    },
    "DatePicker": {
      "colorBgContainer": "#FFFFFF",
      "colorBorder": "rgba(0,0,0,0.15)",
      "colorText": "rgb(26,26,26)",
      "colorTextPlaceholder": "rgb(140,140,140)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
      "borderRadius": 8,
      "activeBorderColor": "rgba(0,0,0,0.4)",
      "hoverBorderColor": "rgba(0,0,0,0.3)",
      "activeShadow": "none",
      "colorBgElevated": "#FFFFFF",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "algorithm": true
    },
    "Select": {
      "colorBgContainer": "#FFFFFF",
      "colorBorder": "rgba(0,0,0,0.15)",
      "colorText": "rgb(26,26,26)",
      "colorTextPlaceholder": "rgb(140,140,140)",
      "borderRadius": 8,
      "activeBorderColor": "rgba(0,0,0,0.4)",
      "hoverBorderColor": "rgba(0,0,0,0.3)",
      "activeOutlineColor": "transparent",
      "colorBgElevated": "#FFFFFF",
      "optionSelectedBg": "rgba(0,0,0,0.04)",
      "optionActiveBg": "rgba(0,0,0,0.02)",
      "optionSelectedColor": "rgb(26,26,26)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
      "colorPrimary": "rgb(26,26,26)",
      "selectorBg": "#FFFFFF",
      "controlItemBgHover": "rgba(0,0,0,0.02)",
      "boxShadowSecondary": "0 6px 16px 0 rgba(0, 0, 0, 0.08)",
      "multipleItemBg": "#F0F0F0",
      "multipleItemBorderColor": "transparent",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "clearBg": "#F0F0F0",
      "algorithm": true
    },
    "InputNumber": {
      "colorBgContainer": "#FFFFFF",
      "colorBorder": "rgba(0,0,0,0.15)",
      "colorText": "rgb(26,26,26)",
      "colorTextPlaceholder": "rgb(140,140,140)",
      "borderRadius": 8,
      "activeBorderColor": "rgba(0,0,0,0.4)",
      "hoverBorderColor": "rgba(0,0,0,0.3)",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "colorBgContainerDisabled": "rgba(0,0,0,0.04)",
      "handleBorderColor": "rgba(0,0,0,0.15)",
      "handleHoverColor": "rgb(26,26,26)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
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
      "colorBgContainer": "#FFFFFF",
      "colorBorder": "rgba(0,0,0,0.15)",
      "colorText": "rgb(26,26,26)",
      "colorTextPlaceholder": "rgb(140,140,140)",
      "borderRadius": 8,
      "colorBgElevated": "#FFFFFF",
      "optionSelectedBg": "rgba(0,0,0,0.04)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
      "colorTextDisabled": "rgba(0,0,0,0.25)",
      "algorithm": true
    },
    "TreeSelect": {
      "colorBgContainer": "#FFFFFF",
      "colorBorder": "rgba(0,0,0,0.15)",
      "colorText": "rgb(26,26,26)",
      "colorTextPlaceholder": "rgb(140,140,140)",
      "borderRadius": 8,
      "colorBgElevated": "#FFFFFF",
      "nodeSelectedBg": "rgba(0,0,0,0.04)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
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
      "borderRadius": 8,
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
      "contentBg": "#FFFFFF",
      "headerBg": "#FFFFFF",
      "titleColor": "rgb(26,26,26)",
      "colorText": "rgb(26,26,26)",
      "colorIcon": "rgb(140,140,140)",
      "colorIconHover": "rgb(26,26,26)",
      "colorBgElevated": "#FFFFFF",
      "colorBgMask": "rgba(0,0,0,0.45)",
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
      "borderRadiusLG": 16,
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
      "colorText": "rgb(26,26,26)",
      "colorBgElevated": "#FFFFFF",
      "controlItemBgHover": "rgba(0,0,0,0.04)",
      "controlItemBgActive": "rgba(0,0,0,0.08)",
      "colorSplit": "rgba(0,0,0,0.06)"
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
