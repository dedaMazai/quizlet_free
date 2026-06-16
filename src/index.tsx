import { createRoot } from 'react-dom/client';
import { ConfigProvider, App } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useLayoutEffect, useMemo } from 'react';
import updateLocale from 'dayjs/plugin/updateLocale';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import * as Sentry from '@sentry/react';
import { StoreProvider } from '@/app/providers/StoreProvider';
import { themeConfig } from '@/app/styles/themes';
import { ErrorBoundary } from './app/providers/ErrorBoundary';
import { NotificationProvider } from './app/providers/NotificationProvider';
import '@/app/styles/index.scss';
import './shared/config/i18n/i18n';
import { AppRouter } from './app/providers/router';
import 'core-js/actual';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { useTheme } from './shared/lib/hooks/useTheme';
import 'dayjs/locale/ru';

if (!__IS_DEV__) {
  Sentry.init({
    dsn: __SENTRY_DSN__,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
    sendDefaultPii: false,
  });
}

dayjs.extend(updateLocale);
dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.updateLocale('ru', {
  months: [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря',
  ],
  weekdays: [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ],
});

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    'Контейнер root не найден. НЕ удалось вмонтировать реакт приложение',
  );
}

const root = createRoot(container);

const AppWrapper = () => {
  const { theme } = useTheme();
  const config = useMemo(() => themeConfig(theme), [theme]);
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    dayjs.locale(i18n.language === 'ru' ? 'ru' : 'en');
  }, [i18n.language]);

  return (
    <ConfigProvider
      theme={config}
      locale={i18n.language === 'ru' ? ruRU : enUS}
    >
      <App>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </App>
    </ConfigProvider>
  );
};

root.render(
  <StoreProvider>
    <ErrorBoundary>
      <ThemeProvider>
        <AppWrapper />
      </ThemeProvider>
    </ErrorBoundary>
  </StoreProvider>,
);
