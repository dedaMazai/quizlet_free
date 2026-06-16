import { useMemo, memo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
    Plugin,
} from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import { useTranslation } from 'react-i18next';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './DoughnutChart.module.scss';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export interface DoughnutChartDataItem {
    label: string;
    value: number;
    color: string;
}

type LabelPosition = 'outside' | 'inside' | 'none';

interface DoughnutChartProps {
    className?: string;
    /** Chart data array with labels, values and colors */
    data: DoughnutChartDataItem[];
    /** Show total in center of chart */
    showCenterTotal?: boolean;
    /** Center total label text */
    centerLabel?: string;
    /** Label position: 'outside' (default), 'inside', or 'none' */
    labelPosition?: LabelPosition;
    /** Cutout percentage (default: 70%) */
    cutout?: string;
    /** Show legend (default: true) */
    showLegend?: boolean;
    /** Chart height in pixels (default: 400) */
    height?: number;
    /** Chart max width in pixels (default: 600) */
    maxWidth?: number;
}

const FONT_FAMILY = '"Open Sans", sans-serif';

/** Reads theme colors from CSS custom properties for Chart.js canvas rendering */
function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
        text: style.getPropertyValue('--text').trim() || '#ffffff',
        textSecondary: style.getPropertyValue('--text-secondary').trim() || '#929292',
        tooltipBg: 'rgba(0, 0, 0, 0.8)',
    };
}

/**
 * Calculates the mid-angle in radians for a segment based on data values
 * Chart.js doughnut starts at -90° (top) and goes clockwise
 */
const calculateMidAngle = (dataValues: number[], index: number): number => {
    const total = dataValues.reduce((acc, val) => acc + val, 0);
    if (total === 0) return 0;

    let cumulativeAngle = -Math.PI / 2;
    for (let i = 0; i < index; i++) {
        cumulativeAngle += (dataValues[i] / total) * 2 * Math.PI;
    }

    const segmentAngle = (dataValues[index] / total) * 2 * Math.PI;
    return cumulativeAngle + segmentAngle / 2;
};

/**
 * Determines if a label should be on the right side based on angle
 */
const isRightSide = (midAngle: number): boolean => {
    const normalized = ((midAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return normalized < Math.PI / 2 || normalized > (3 * Math.PI) / 2;
};

/**
 * DoughnutChart - Reusable doughnut chart component
 * @param className - additional CSS classes
 * @param data - chart data array with labels, values and colors
 * @param showCenterTotal - show total value in center
 * @param centerLabel - label for center text
 * @param labelPosition - position of data labels
 * @param cutout - cutout percentage for donut hole
 * @param showLegend - show legend below chart
 * @param height - chart height
 * @param maxWidth - chart max width
 */
export const DoughnutChart= memo((props: DoughnutChartProps) => {
    const {
        className,
        data,
        showCenterTotal = true,
        centerLabel,
        labelPosition = 'outside',
        cutout = '70%',
        showLegend = true,
        height = 400,
        maxWidth = 600,
    } = props;
    const { t } = useTranslation();

    const total = useMemo(() => {
        return data.reduce((acc, item) => acc + item.value, 0);
    }, [data]);

    const dataValues = useMemo(() => data.map((item) => item.value), [data]);
    const colors = useMemo(() => data.map((item) => item.color), [data]);

    const centerTextPlugin: Plugin<'doughnut'> = useMemo(
        () => ({
            id: 'centerText',
            beforeDraw: (chart) => {
                if (!showCenterTotal) return;

                const themeColors = getThemeColors();
                const { ctx } = chart;
                const { top, bottom, left, right } = chart.chartArea;
                const width = right - left;
                const chartHeight = bottom - top;
                const centerX = left + width / 2;
                const centerY = top + chartHeight / 2;

                ctx.save();

                // Draw total value
                const fontSize = Math.min(width, chartHeight) / 4;
                ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
                ctx.fillStyle = themeColors.text;
                ctx.textAlign = 'center';
                ctx.textBaseline = centerLabel ? 'bottom' : 'middle';

                ctx.fillText(total.toString(), centerX, centerLabel ? centerY : centerY);

                // Draw label if provided
                if (centerLabel) {
                    const labelFontSize = fontSize / 2.5;
                    ctx.font = `${labelFontSize}px ${FONT_FAMILY}`;
                    ctx.fillStyle = themeColors.textSecondary;
                    ctx.textBaseline = 'top';
                    ctx.fillText(t(centerLabel), centerX, centerY + 4);
                }

                ctx.restore();
            },
        }),
        [showCenterTotal, total, centerLabel, t],
    );

    const chartData: ChartData<'doughnut'> = useMemo(
        () => ({
            labels: data.map((item) => t(item.label)),
            datasets: [
                {
                    data: dataValues,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 4,
                },
            ],
        }),
        [data, dataValues, colors, t],
    );

    const getDataLabelsConfig = useMemo(() => {
        if (labelPosition === 'none') {
            return { display: false };
        }

        if (labelPosition === 'inside') {
            return {
                display: true,
                anchor: 'center' as const,
                align: 'center' as const,
                color: getThemeColors().text,
                font: {
                    family: FONT_FAMILY,
                    size: 12,
                    weight: 'bold' as const,
                },
                formatter: (value: number) => value.toString(),
            };
        }

        // Outside labels (default)
        return {
            display: true,
            anchor: 'end' as const,
            align: (context: Context) => {
                const midAngle = calculateMidAngle(dataValues, context.dataIndex);
                return isRightSide(midAngle) ? 'right' : 'left';
            },
            offset: 20,
            clamp: false,
            color: (context: Context) => colors[context.dataIndex] || getThemeColors().text,
            font: {
                family: FONT_FAMILY,
                size: 14,
                weight: 'normal' as const,
            },
            formatter: (value: number, context: Context) => {
                const label = context.chart.data.labels?.[context.dataIndex] || '';
                return `${label}\n${value}`;
            },
            textAlign: (context: Context) => {
                const midAngle = calculateMidAngle(dataValues, context.dataIndex);
                return isRightSide(midAngle) ? 'left' : 'right';
            },
        };
    }, [labelPosition, dataValues, colors]);

    const options: ChartOptions<'doughnut'> = useMemo(
        () => {
            const themeColors = getThemeColors();
            return {
                responsive: true,
                maintainAspectRatio: false,
                cutout,
                layout: {
                    padding:
                        labelPosition === 'outside'
                            ? { top: 60, bottom: 60, left: 100, right: 100 }
                            : { top: 20, bottom: 20, left: 20, right: 20 },
                },
                plugins: {
                    legend: {
                        display: showLegend,
                        position: 'bottom',
                        labels: {
                            color: themeColors.text,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 24,
                            font: {
                                family: FONT_FAMILY,
                                size: 14,
                            },
                        },
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: themeColors.tooltipBg,
                        titleFont: { family: FONT_FAMILY },
                        bodyFont: { family: FONT_FAMILY },
                    },
                    datalabels: getDataLabelsConfig,
                },
            };
        },
        [cutout, labelPosition, showLegend, getDataLabelsConfig],
    );

    const style = useMemo(
        () => ({
            height: `${height}px`,
            maxWidth: `${maxWidth}px`,
        }),
        [height, maxWidth],
    );

    return (
        <div className={classNames(cls.DoughnutChart, [className])} style={style}>
            <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
        </div>
    );
});

DoughnutChart.displayName = 'DoughnutChart';
