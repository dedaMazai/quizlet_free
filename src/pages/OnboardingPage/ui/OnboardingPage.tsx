import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetUserPreferencesQuery, useUpdateUserPreferencesMutation } from '@/entities/UserSettings';
import { RoutePath } from '@/shared/config/router/routePath';
import { useToast } from '@/shared/lib/toast';
import {
    DECK_PARAM, getStepParam, OnboardingStep, parseStep, STEP_PARAM,
} from '../model/onboarding';
import { DeckStep } from './DeckStep/DeckStep';
import { GoalStep } from './GoalStep/GoalStep';
import { OnboardingHeader } from './OnboardingHeader/OnboardingHeader';
import { SessionStep } from './SessionStep/SessionStep';

/** Онбординг первого входа (BACKLOG §5): цель дня → первая колода → первая сессия «Карточки» */
const OnboardingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: preferences } = useGetUserPreferencesQuery();
    const [updatePreferences] = useUpdateUserPreferencesMutation();

    const stepParam = searchParams.get(STEP_PARAM);
    const deckUuid = searchParams.get(DECK_PARAM) ?? undefined;
    const step = parseStep(stepParam, deckUuid);

    const goToStep = useCallback((next: OnboardingStep, nextDeckUuid?: string, replace = false) => {
        const params: Record<string, string> = {};
        const nextStepParam = getStepParam(next);
        if (nextStepParam) params[STEP_PARAM] = nextStepParam;
        if (nextDeckUuid) params[DECK_PARAM] = nextDeckUuid;
        setSearchParams(params, { replace });
    }, [setSearchParams]);

    /** true — флаг сохранён; при ошибке остаёмся в онбординге, иначе главная вернула бы сюда же */
    const markDone = useCallback(async (): Promise<boolean> => {
        try {
            await updatePreferences({ onboardingDone: true }).unwrap();
            return true;
        } catch {
            toast.error(t('Не удалось сохранить настройки'));
            return false;
        }
    }, [updatePreferences, toast, t]);

    const goHome = useCallback(() => navigate(RoutePath.MAIN(), { replace: true }), [navigate]);

    const skip = useCallback(async () => {
        if (await markDone()) goHome();
    }, [markDone, goHome]);

    const chooseDeck = useCallback((uuid?: string) => {
        goToStep(OnboardingStep.DECK, uuid, true);
    }, [goToStep]);

    // Уже пройденный онбординг заново с первого шага не открываем
    if (!stepParam && preferences?.onboardingDone) {
        return <Navigate to={RoutePath.MAIN()} replace />;
    }

    const header = <OnboardingHeader step={step} onSkip={skip} />;

    if (step === OnboardingStep.SESSION && deckUuid) {
        return (
            <SessionStep
                header={header}
                deckUuid={deckUuid}
                onSkip={skip}
                onChooseDeck={chooseDeck}
                onComplete={markDone}
                onFinish={goHome}
            />
        );
    }

    if (step === OnboardingStep.DECK) {
        return (
            <DeckStep
                header={header}
                deckUuid={deckUuid}
                onDeckCreated={(uuid) => goToStep(OnboardingStep.DECK, uuid, true)}
                onReady={(uuid) => goToStep(OnboardingStep.SESSION, uuid)}
            />
        );
    }

    return <GoalStep header={header} onNext={() => goToStep(OnboardingStep.DECK)} />;
};

export default OnboardingPage;
