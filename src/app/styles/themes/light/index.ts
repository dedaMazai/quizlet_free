import { ThemeConfig, theme } from 'antd';

const { getDesignToken } = theme;
const globalToken = getDesignToken();

export const LightTheme: ThemeConfig['token'] = {
    ...globalToken,
    // Brand colors (same across themes)
    "colorError": "#eb5151",
    "colorWarning": "#f57834",
    "colorSuccess": "#69bb80",
    "colorLink": "#416180",
    "wireframe": false,
    "borderRadius": 0,
    "controlHeight": 38,
    "fontFamily": "'Fira Sans', sans-serif",
    "fontFamilyCode": "'JetBrains Mono', monospace",

    // Primary colors (steel accent)
    "colorPrimary": "#5980a6",
    "colorPrimaryHover": "#597ea3",
    "colorPrimaryActive": "#416180",
    "colorPrimaryBg": "#eef6ff",
    "colorPrimaryBgHover": "#d6ebff",
    "colorInfo": "#5980a6",

    // Background tokens
    "colorBgElevated": "#FFFFFF",
    "colorBgContainer": "#FFFFFF",
    "colorBgLayout": "#f2f2f3",
    "colorBgSpotlight": "#FFFFFF",
    "colorBgMask": "rgba(0, 0, 0, 0.45)",

    // Text colors
    "colorText": "#1d1f20",
    "colorTextLightSolid": "#ffffff",
    "colorTextSecondary": "#5d5d60",
    "colorTextTertiary": "rgba(0, 0, 0, 0.45)",
    "colorTextQuaternary": "rgba(0, 0, 0, 0.25)",
    "colorTextDescription": "#5d5d60",

    // Disabled states
    "colorTextDisabled": "rgba(0, 0, 0, 0.25)",
    "colorBgContainerDisabled": "rgba(0, 0, 0, 0.04)",
    "colorBorderBg": "rgba(0, 0, 0, 0.15)",

    // Borders and dividers
    "colorBorder": "rgba(29, 31, 32, 0.16)",
    "colorSplit": "rgba(29, 31, 32, 0.16)",
};
