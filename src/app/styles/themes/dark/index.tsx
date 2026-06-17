import { ThemeConfig, theme } from 'antd';

const { getDesignToken } = theme;
const globalToken = getDesignToken();

export const DarkTheme: ThemeConfig['token'] = {
    ...globalToken,
    // Brand colors (same across themes)
    "colorError": "#eb5151",
    "colorWarning": "#f57834",
    "colorSuccess": "#69bb80",
    "colorLink": "#7C8BFF",
    "wireframe": false,
    "borderRadius": 8,

    // Primary colors (indigo brand accent, brighter for dark bg)
    "colorPrimary": "#5B6BFF",
    "colorPrimaryHover": "#6E7CFF",
    "colorPrimaryActive": "#4A59E6",
    "colorPrimaryBg": "#1E1F35",
    "colorPrimaryBgHover": "#26284A",
    "colorInfo": "#5B6BFF",

    // Background tokens (improved readability - bluish neutral blacks)
    "colorBgElevated": "rgb(28, 28, 34)",
    "colorBgContainer": "rgb(28, 28, 34)",
    "colorBgLayout": "rgb(20, 20, 25)",
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
