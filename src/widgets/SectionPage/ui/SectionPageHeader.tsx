import { memo, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetDueCountQuery } from '@/entities/Card';
import { QuickSettingsButton } from '@/features/QuickSettings';
import { RoutePath } from '@/shared/config/router/routePath';
import { getNavSections, NavSectionKey } from '@/shared/const/menu';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { PageHeader } from '@/shared/ui/PageHeader';

interface SectionPageHeaderProps {
    section: NavSectionKey;
    /** Кнопки справа от H1 */
    extra?: ReactNode;
}

/** Шапка страницы раздела: H1 раздела, действия и вкладки (README §2) */
export const SectionPageHeader = memo(({ section, extra }: SectionPageHeaderProps) => {
    const { t } = useTranslation();
    const { isMobile } = useMatchMedia();
    const { data: due } = useGetDueCountQuery(undefined, {
        skip: section !== NavSectionKey.LEARN,
    });

    const navSection = useMemo(
        () => getNavSections({ t }).find(({ key }) => key === section),
        [t, section],
    );

    const tabs = useMemo(
        () => (navSection?.tabs ?? []).map((tab) => (
            tab.to === RoutePath.REVIEW() && due?.count
                ? { ...tab, count: due.count, countHighlighted: true }
                : tab
        )),
        [navSection, due?.count],
    );

    if (!navSection) {
        return null;
    }

    // На мобильном нет топбара — тема и язык доступны из шапки раздела
    const headerExtra = isMobile ? (
        <>
            {extra}
            <QuickSettingsButton />
        </>
    ) : extra;

    return <PageHeader title={navSection.label} extra={headerExtra} tabs={tabs} />;
});

SectionPageHeader.displayName = 'SectionPageHeader';
