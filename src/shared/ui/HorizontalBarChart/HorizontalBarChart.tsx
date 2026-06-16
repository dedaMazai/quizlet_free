import { FC, useMemo, memo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './HorizontalBarChart.module.scss';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export interface BarChartDataset {
    label: string;
    data: number[];
    color: string;
}

export interface HorizontalBarChartProps {
    className?: string;
    /** Labels for Y-axis (categories) */
    labels: string[];
    /** Array of datasets to display */
    datasets: BarChartDataset[];
    /** Maximum value for X-axis (default: auto) */
    maxValue?: number;
    /** Show legend (default: true) */
    showLegend?: boolean;
    /** Show grid lines (default: true) */
    showGrid?: boolean;
    /** Chart height in pixels (default: 400) */
    height?: number;
    /** Chart max width in pixels (default: 900) */
    maxWidth?: number;
    /** Bar percentage (default: 0.7) */
    barPercentage?: number;
    /** Category percentage (default: 0.8) */
    categoryPercentage?: number;
}

const FONT_FAMILY = '"Open Sans", sans-serif';
const DEFAULT_BAR_PERCENTAGE = 0.7;
const DEFAULT_CATEGORY_PERCENTAGE = 0.8;

/** Reads theme colors from CSS custom properties for Chart.js canvas rendering */
function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
        text: style.getPropertyValue('--text').trim() || '#ffffff',
        textSecondary: style.getPropertyValue('--text-secondary').trim() || '#A0A0A0',
        grid: style.getPropertyValue('--border-medium').trim() || 'rgba(255, 255, 255, 0.2)',
        tooltipBg: 'rgba(0, 0, 0, 0.8)',
    };
}

/**
 * HorizontalBarChart - Reusable horizontal grouped bar chart component
 * @param className - additional CSS classes
 * @param labels - category labels for Y-axis
 * @param datasets - array of datasets to display
 * @param maxValue - maximum value for X-axis
 * @param showLegend - show legend below chart
 * @param showGrid - show grid lines
 * @param height - chart height
 * @param maxWidth - chart max width
 * @param barPercentage - bar width percentage
 * @param categoryPercentage - category width percentage
 */
export const HorizontalBarChart: FC<HorizontalBarChartProps> = memo((props) => {
    const {
        className,
        labels,
        datasets,
        maxValue,
        showLegend = true,
        showGrid = true,
        height = 400,
        maxWidth = 900,
        barPercentage = DEFAULT_BAR_PERCENTAGE,
        categoryPercentage = DEFAULT_CATEGORY_PERCENTAGE,
    } = props;
    const { t } = useTranslation();

    const chartData: ChartData<'bar'> = useMemo(
        () => ({
            labels: labels.map((label) => t(label)),
            datasets: datasets.map((dataset) => ({
                label: t(dataset.label),
                data: dataset.data,
                backgroundColor: dataset.color,
                barPercentage,
                categoryPercentage,
            })),
        }),
        [labels, datasets, barPercentage, categoryPercentage, t],
    );

    const options: ChartOptions<'bar'> = useMemo(
        () => {
            const themeColors = getThemeColors();
            return {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        position: 'top',
                        min: 0,
                        ...(maxValue && { max: maxValue }),
                        ticks: {
                            color: themeColors.textSecondary,
                            font: {
                                family: FONT_FAMILY,
                                size: 12,
                            },
                            stepSize: maxValue ? maxValue / 5 : undefined,
                        },
                        grid: {
                            display: showGrid,
                            color: themeColors.grid,
                            lineWidth: 1,
                            drawTicks: false,
                        },
                        border: {
                            display: false,
                        },
                    },
                    y: {
                        ticks: {
                            color: themeColors.textSecondary,
                            font: {
                                family: FONT_FAMILY,
                                size: 12,
                            },
                        },
                        grid: {
                            display: showGrid,
                            color: themeColors.grid,
                            lineWidth: 1,
                            drawTicks: false,
                        },
                        border: {
                            display: false,
                        },
                    },
                },
                plugins: {
                    datalabels: {
                        display: false,
                    },
                    legend: {
                        display: showLegend,
                        position: 'bottom',
                        labels: {
                            color: themeColors.text,
                            usePointStyle: true,
                            pointStyle: 'rect',
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
                },
            };
        },
        [maxValue, showGrid, showLegend],
    );

    const style = useMemo(
        () => ({
            height: `${height}px`,
            maxWidth: `${maxWidth}px`,
        }),
        [height, maxWidth],
    );

    return (
        <div className={classNames(cls.HorizontalBarChart, [className])} style={style}>
            <Bar data={chartData} options={options} />
        </div>
    );
});

HorizontalBarChart.displayName = 'HorizontalBarChart';
