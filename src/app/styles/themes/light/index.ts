import { ThemeConfig, theme } from 'antd';

const { getDesignToken } = theme;
const globalToken = getDesignToken();

export const LightTheme: ThemeConfig['token'] = {
    ...globalToken,
    // Brand colors (same across themes)
    "colorError": "#eb5151",
    "colorWarning": "#f57834",
    "colorSuccess": "#69bb80",
    "colorLink": "#4255FF",
    "wireframe": false,
    "borderRadius": 8,

    // Primary colors (indigo brand accent)
    "colorPrimary": "#4255FF",
    "colorPrimaryHover": "#3646E6",
    "colorPrimaryActive": "#2D3BC4",
    "colorPrimaryBg": "#EEF0FF",
    "colorPrimaryBgHover": "#E2E5FF",
    "colorInfo": "#4255FF",

    // Background tokens
    "colorBgElevated": "#FFFFFF",
    "colorBgContainer": "#FFFFFF",
    "colorBgLayout": "#F4F5FB",
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
