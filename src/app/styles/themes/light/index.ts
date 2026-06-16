import { ThemeConfig, theme } from 'antd';

const { getDesignToken } = theme;
const globalToken = getDesignToken();

export const LightTheme: ThemeConfig['token'] = {
    ...globalToken,
    // Brand colors (same across themes)
    "colorError": "#eb5151",
    "colorWarning": "#f57834",
    "colorSuccess": "#69bb80",
    "colorLink": "#722ed1",
    "wireframe": false,
    "borderRadius": 8,

    // Primary colors (black primary -- brand identity)
    "colorPrimary": "#0E0E0E",
    "colorPrimaryBg": "#FFFFFF",
    "colorPrimaryBgHover": "rgba(0, 0, 0, 0.04)",
    "colorInfo": "#000000",

    // Background tokens
    "colorBgElevated": "#FFFFFF",
    "colorBgContainer": "#FFFFFF",
    "colorBgLayout": "#F5F5F5",
    "colorBgSpotlight": "#FFFFFF",
    "colorBgMask": "rgba(0, 0, 0, 0.45)",

    // Text colors
    "colorText": "rgb(26, 26, 26)",
    "colorTextLightSolid": "#ffffff",
    "colorTextSecondary": "#666666",
    "colorTextTertiary": "rgba(0, 0, 0, 0.45)",
    "colorTextQuaternary": "rgba(0, 0, 0, 0.25)",
    "colorTextDescription": "#666666",

    // Disabled states
    "colorTextDisabled": "rgba(0, 0, 0, 0.25)",
    "colorBgContainerDisabled": "rgba(0, 0, 0, 0.04)",
    "colorBorderBg": "rgba(0, 0, 0, 0.15)",
};
