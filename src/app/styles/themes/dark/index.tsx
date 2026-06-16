import { ThemeConfig, theme } from 'antd';

const { getDesignToken } = theme;
const globalToken = getDesignToken();

export const DarkTheme: ThemeConfig['token'] = {
    ...globalToken,
    // Brand colors (same across themes)
    "colorError": "#eb5151",
    "colorWarning": "#f57834",
    "colorSuccess": "#69bb80",
    "colorLink": "#a78bfa",
    "wireframe": false,
    "borderRadius": 8,

    // Primary colors
    "colorPrimary": "#0E0E0E",
    "colorPrimaryBg": "#1A1A1A",
    "colorPrimaryBgHover": "rgba(255, 255, 255, 0.08)",
    "colorInfo": "#000000",

    // Background tokens (improved readability - lighter blacks)
    "colorBgElevated": "rgb(34, 34, 34)",
    "colorBgContainer": "rgb(26, 26, 26)",
    "colorBgLayout": "rgb(20, 20, 20)",
    "colorBgSpotlight": "rgb(51, 51, 51)",
    "colorBgMask": "rgba(0, 0, 0, 0.65)",

    // Text colors (improved contrast)
    "colorText": "rgb(255, 255, 255)",
    "colorTextLightSolid": "#ffffff",
    "colorTextSecondary": "#A0A0A0",
    "colorTextTertiary": "rgba(255, 255, 255, 0.45)",
    "colorTextQuaternary": "rgba(255, 255, 255, 0.25)",
    "colorTextDescription": "#A0A0A0",

    // Disabled states
    "colorTextDisabled": "rgba(255, 255, 255, 0.45)",
    "colorBgContainerDisabled": "rgba(255, 255, 255, 0.08)",
    "colorBorderBg": "rgba(255, 255, 255, 0.16)",
};
