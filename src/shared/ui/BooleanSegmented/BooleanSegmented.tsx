import { FC } from 'react';
import { Segmented, SegmentedProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './BooleanSegmented.module.scss';

type BooleanValue = 'yes' | 'no' | boolean;

interface BooleanSegmentedProps extends Omit<SegmentedProps, 'options' | 'value' | 'onChange'> {
    className?: string;
    value?: BooleanValue;
    onChange?: (value: BooleanValue) => void;
    yesLabel?: string;
    noLabel?: string;
}

/**
 * BooleanSegmented - Yes/No toggle with color states
 * Green when "yes" is selected, red when "no" is selected
 */
export const BooleanSegmented: FC<BooleanSegmentedProps> = (props) => {
    const {
        className,
        value,
        onChange,
        yesLabel,
        noLabel,
        ...segmentedProps
    } = props;

    const { t } = useTranslation();

    const normalizedValue = value === true ? 'yes' : value === false ? 'no' : value;
    const isPositive = normalizedValue === 'yes';
    const isNegative = normalizedValue === 'no';

    const handleChange = (val: string | number) => {
        onChange?.(val as BooleanValue);
    };

    return (
        <Segmented
            className={classNames(cls.BooleanSegmented, [className], {
                [cls.positive]: isPositive,
                [cls.negative]: isNegative,
            })}
            value={normalizedValue}
            onChange={handleChange}
            options={[
                { label: yesLabel ?? t('Да'), value: 'yes' },
                { label: noLabel ?? t('Нет'), value: 'no' },
            ]}
            {...segmentedProps}
        />
    );
};
