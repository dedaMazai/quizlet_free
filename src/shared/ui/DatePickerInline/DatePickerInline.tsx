import {
  useRef,
} from 'react';
import {
  Button,
  DatePicker,
  Popover,
} from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { classNames } from '@/shared/lib/classNames/classNames';
import { HStack } from '../Stack';
import cls from './DatePickerInline.module.scss';

interface DatePickerInlineProps extends Omit<RangePickerProps, 'open' | 'getPopupContainer' | 'value' | 'renderExtraFooter' | 'placeholder'> {
  value?: [
    start?: string | null,
    end?: string | null,
  ]
  placeholder: string
}

export const DatePickerInline = (allProps: DatePickerInlineProps) => {
  const {
    className,
    rootClassName,
    value,
    onChange,
    placeholder,
    ...props
  } = allProps;
  const refDatePickerContainer = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const valueData: [
    start: dayjs.Dayjs | null | undefined,
    end: dayjs.Dayjs | null | undefined,
  ] = [
    value?.[0]
      ? dayjs(value[0])
      : undefined,
    value?.[1]
      ? dayjs(value[1])
      : undefined,
  ];

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return '';
    return dayjs(date).format('DD.MM.YYYY');
  };

  let text = placeholder || t('Выбор даты');

  const startFormatted = formatDate(value?.[0]);
  const endFormatted = formatDate(value?.[1]);

  if (value?.[0] && value?.[0] === value?.[1]) {
    text = startFormatted;
  } else if (value?.[0] && value?.[1]) {
    text = `${startFormatted} - ${endFormatted}`;
  }

  return (
    <Popover
      trigger={['click']}
      destroyOnHidden
      content={(
        <div
          ref={refDatePickerContainer}
          className={classNames(cls.output)}
        >
          <DatePicker.RangePicker
            open
            value={valueData}
            onChange={onChange}
            rootClassName={classNames(cls.root, rootClassName)}
            className={className}
            getPopupContainer={() => refDatePickerContainer.current as HTMLElement}
            needConfirm={false}
            renderExtraFooter={() => (
              <HStack
                max
                justify="end"
                style={{
                  paddingTop: 8,
                }}
              >
                <Button onClick={() => onChange?.(null, ['', ''])}>
                  {t('Очистить')}
                </Button>
              </HStack>
            )}
            {...props}
          />
        </div>
      )}
    >
      <Button>
        {text}
      </Button>
    </Popover>
  );
};
