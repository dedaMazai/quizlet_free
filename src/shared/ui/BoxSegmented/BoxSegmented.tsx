import { Segmented, SegmentedProps } from 'antd';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './BoxSegmented.module.scss';

type BoxSegmentedProps<T> = Omit<SegmentedProps<T>, 'classNames' | 'ref'>;

/** Сегменты в рамке divider с разделителями, активный — accent (Аккаунт 6.25) */
export const BoxSegmented = <T extends string | number>(props: BoxSegmentedProps<T>) => {
    const { className, ...rest } = props;

    return (
        <Segmented<T>
            className={classNames(cls.BoxSegmented, [className])}
            classNames={{ item: cls.item, label: cls.label }}
            {...rest}
        />
    );
};
