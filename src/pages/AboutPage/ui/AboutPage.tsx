import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useUserInfo } from '@/entities/User';
import { getRegisterPath, RoutePath } from '@/shared/config/router/routePath';

import { HeroSection } from './sections/HeroSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { ModesSection } from './sections/ModesSection';
import { MemorySection } from './sections/MemorySection';
import { AiSection } from './sections/AiSection';
import { GrammarSection } from './sections/GrammarSection';
import { CyclesSection } from './sections/CyclesSection';
import { ProgressSection } from './sections/ProgressSection';
import { DetailsSection } from './sections/DetailsSection';
import { CompareFaqSection } from './sections/CompareFaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';
import cls from './AboutPage.module.scss';

/** Лендинг «О сервисе»: каждая возможность показана живым демо на моковых данных */
const AboutPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { hash, key } = useLocation();
    const userInfo = useUserInfo();

    // Якоря из шапки и редиректы со старых /features и /faq
    useEffect(() => {
        if (hash) {
            document.getElementById(hash.slice(1))?.scrollIntoView();
        }
    }, [hash, key]);

    // Гость попадает сразу на регистрацию, вошедший — в приложение
    const handleStart = useCallback(
        () => navigate(userInfo ? RoutePath.MAIN() : getRegisterPath()),
        [navigate, userInfo],
    );
    const ctaLabel = userInfo ? t('В приложение') : t('Начать бесплатно');

    return (
        <div className={cls.AboutPage}>
            <HeroSection ctaLabel={ctaLabel} onStart={handleStart} />
            <HowItWorksSection />
            <ModesSection />
            <MemorySection />
            <AiSection />
            <GrammarSection />
            <CyclesSection />
            <ProgressSection />
            <DetailsSection />
            <CompareFaqSection />
            <FinalCtaSection ctaLabel={ctaLabel} onStart={handleStart} />
        </div>
    );
};

export default AboutPage;
