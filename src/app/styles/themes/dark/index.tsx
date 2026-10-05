import { ThemeConfig, theme } from 'antd';

const { getDesignToken, darkAlgorithm } = theme;

// BACKLOG §6: тёмная тема из тех же ramp'ов
const darkSeeds: ThemeConfig['token'] = {
    "colorError": "#eb5151",
    "colorWarning": "#f57834",
    "colorSuccess": "#69bb80",
    "colorLink": "#94bce3",
    "wireframe": false,
    "borderRadius": 0,
    "controlHeight": 38,
    "fontFamily": "'Fira Sans', sans-serif",
    "fontFamilyCode": "'JetBrains Mono', monospace",

    // Primary colors (accent-500 — для контраста на тёмном)
    "colorPrimary": "#749dc4",
    "colorPrimaryHover": "#94bce3",
    "colorPrimaryActive": "#b5d9fd",
    "colorPrimaryBg": "rgba(116, 157, 196, 0.12)",
    "colorPrimaryBgHover": "rgba(116, 157, 196, 0.24)",
    "colorInfo": "#749dc4",

    // Background tokens
    "colorBgBase": "#141b23",
    "colorBgElevated": "#1b2530",
    "colorBgContainer": "#1b2530",
    "colorBgLayout": "#141b23",
    "colorBgSpotlight": "#1b2530",
    "colorBgMask": "rgba(0, 0, 0, 0.6)",

    // Text colors: на primary #749dc4 белый даёт 2.85:1, поэтому текст тёмный
    "colorTextBase": "#e9edf2",
    "colorText": "#e9edf2",
    "colorTextLightSolid": "#141b23",
    "colorTextSecondary": "#b7b7ba",
    "colorTextTertiary": "rgba(233, 237, 242, 0.6)",
    "colorTextQuaternary": "rgba(233, 237, 242, 0.3)",
    "colorTextDescription": "#b7b7ba",

    // Disabled states
    "colorTextDisabled": "rgba(233, 237, 242, 0.35)",
    "colorBgContainerDisabled": "rgba(233, 237, 242, 0.06)",
    "colorBorderBg": "rgba(233, 237, 242, 0.14)",

    // Borders and dividers
    "colorBorder": "rgba(233, 237, 242, 0.14)",
    "colorSplit": "rgba(233, 237, 242, 0.14)",
};

export const DarkTheme: ThemeConfig['token'] = {
    ...getDesignToken({ algorithm: darkAlgorithm, token: darkSeeds }),
    ...darkSeeds,
};
