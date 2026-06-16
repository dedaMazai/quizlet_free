import { useState, useCallback, useMemo, memo } from 'react';
import { Button, ButtonProps } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { HStack, VStack } from '../Stack';
import { MyTypography } from '../MyTypography';
import { MONTHS, MOSCOW_TIMEZONE, WEEKDAYS_SHORT } from '@/shared/const/const';

export const TIME_SLOTS_SECONDARY = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
] as const;

export const DAY_BEFORE_START = 1;

export type TimeSlot = typeof TIME_SLOTS_SECONDARY[number];

interface DateTimePickerProps {
  value?: Dayjs;
  onChange?: (date?: Dayjs) => void;
  className?: string;
  disabled?: boolean;
  disabledDates?: Dayjs[];
  disabledTimes?: TimeSlot[];
  startDate?: string;
  dayBeforeStart?: number;
}

export const DateTimePicker = memo((props: DateTimePickerProps) => {
  const { t } = useTranslation();
  const {
    value,
    onChange,
    className,
    disabled = false,
    disabledDates,
    disabledTimes,
    startDate,
    dayBeforeStart = DAY_BEFORE_START,
  } = props;

  // Инициализируем дату в московском часовом поясе
  const [currentDate, setCurrentDate] = useState(
    value ? dayjs(value).tz(MOSCOW_TIMEZONE) : dayjs().tz(MOSCOW_TIMEZONE)
  );
  const startOfWeek = currentDate.startOf('isoWeek');

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => prev.subtract(7, 'day'));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => prev.add(7, 'day'));
  }, []);

  const handleDateSelect = useCallback((selectedDay: Dayjs) => {
    // Получаем текущее время из value или используем 08:00 по умолчанию
    const moscowValue = value ? dayjs(value).tz(MOSCOW_TIMEZONE) : null;
    const currentTime = moscowValue?.format('HH:mm') || '08:00';
    const [hours, minutes] = currentTime.split(':').map(Number);
    
    // Создаем дату в московском часовом поясе
    const finalDate = selectedDay
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0)
      .tz(MOSCOW_TIMEZONE, true); // true сохраняет локальное время
    onChange?.(finalDate);
  }, [value, onChange]);

  const handleTimeSelect = useCallback((time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    
    // Работаем с датой в московском часовом поясе
    const moscowDate = value 
      ? dayjs(value).tz(MOSCOW_TIMEZONE) 
      : dayjs().tz(MOSCOW_TIMEZONE);
    
    // Устанавливаем время в московском часовом поясе
    const finalDate = moscowDate
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0);
    onChange?.(finalDate);
  }, [value, onChange]);

  const weekDays = useMemo(() => {
    const days = [];
    const moscowNow = dayjs().tz(MOSCOW_TIMEZONE);
    const moscowValue = value ? dayjs(value).tz(MOSCOW_TIMEZONE) : null;

    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day');
      const dayNumber = day.date();
      const isSelected = moscowValue && day.isSame(moscowValue, 'day');
      const isToday = day.isSame(moscowNow, 'day');

      const defaultStartDay = moscowNow.add(dayBeforeStart, 'day');
      const providedStartDay = startDate ? dayjs(startDate).tz(MOSCOW_TIMEZONE) : defaultStartDay;
      const startDay = providedStartDay.isAfter(defaultStartDay) ? providedStartDay : defaultStartDay;
      const isPastDate = day.isBefore(startDay, 'day');

      const weekdayShort = t(WEEKDAYS_SHORT[i]);

      let variant: ButtonProps['variant'] = 'filled';

      switch (true) {
        case isSelected:
          variant = 'solid';
            break;
        case isToday:
          variant = 'outlined';
            break;
        default:
    }

    days.push({
      day,
      dayNumber,
      weekdayShort,
      variant,
      isSelected,
      isToday,
      isPastDate,
    });
  }

    return days;
  }, [dayBeforeStart, startDate, startOfWeek, t, value]);

  // Получаем выбранное время в московском часовом поясе
  const selectedTime = value 
    ? dayjs(value).tz(MOSCOW_TIMEZONE).format('HH:mm') 
    : undefined;

  return (
    <VStack className={className} gap="24" max>
      {/* Дни недели с датами */}
      <VStack gap="8" max>
        <HStack justify="between" max>
          <MyTypography.Base strong>
            {t(MONTHS[currentDate.month()])} - {currentDate.year()}
          </MyTypography.Base>
          <HStack gap="4">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={handlePrevMonth}
            />
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={handleNextMonth}
            />
          </HStack>
        </HStack>

        {/* Дни недели с датами */}
        <HStack gap="8" max justify="between">
          {weekDays.map(({ day, dayNumber, weekdayShort, variant, isSelected, isToday, isPastDate }) => {
            const isDisabledDate = disabledDates?.some(disabledDate => day.isSame(disabledDate, 'day'));
            return (
              <Button
                key={day.format('YYYY-MM-DD')}
                block
                style={{
                  height: '60px',
                  minWidth: 0,
                  flex: 1,
                }}
                onClick={() => handleDateSelect(day)}
                color={isSelected || isToday ? 'primary' : 'default'}
                variant={variant}
                disabled={isPastDate || disabled || isDisabledDate}
              >
                <VStack gap="4" align="center">
                  <MyTypography.Base style={{ color: 'currentcolor' }}>
                    {weekdayShort}
                  </MyTypography.Base>
                  <MyTypography.Base strong style={{ color: 'currentcolor' }}>
                    {dayNumber}
                  </MyTypography.Base>
                </VStack>
              </Button>
            );
          })}
        </HStack>
      </VStack>

      {/* Выбор времени */}
      <VStack gap="8" max>
        <MyTypography.Base strong>{t('Время')}</MyTypography.Base>
        {value ? (
          <HStack gap="8" max wrap>
            {TIME_SLOTS_SECONDARY.map(time => {
              const isDisabledTime = disabledTimes?.includes(time);
              return (
                <Button
                  key={time}
                  style={{
                    // minWidth: '60px',
                    width: '72px',
                    flex: '1 1 calc(20% - 8px)',
                  }}
                  color={selectedTime === time ? 'primary' : 'default'}
                  variant={selectedTime === time ? 'solid' : 'filled'}
                  onClick={() => handleTimeSelect(time)}
                  disabled={disabled || isDisabledTime}
                >
                  {time}
                </Button>
              );
            })}
          </HStack>
        ) : (
          <MyTypography.Base type="secondary">
            {t('Выберите дату')}
          </MyTypography.Base>
        )}
      </VStack>
      <MyTypography.Base strong>
        {t('* Запись производится по Москвоскому времени')}
      </MyTypography.Base>
    </VStack>
  );
});