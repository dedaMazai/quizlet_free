import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Empty, List, Progress, Result,
} from 'antd';
import { CycleWord } from '@/entities/LearningCycle';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useCycleSession } from '../model/hooks/useCycleSession';
import { CyclePrompt } from './CyclePrompt';
import { CycleFeedback } from './CycleFeedback';
import cls from './CycleSession.module.scss';

interface CycleSessionProps {
  /** Слова сессии в порядке цикла. */
  words: CycleWord[];
  /** Ключ localStorage для восстановления незаконченной сессии. */
  storageKey: string;
  finishedTitle: string;
  /** Дополнительные действия на экране завершения (переходы дальше). */
  finishedActions?: ReactNode;
}

export const CycleSession: FC<CycleSessionProps> = (props) => {
  const {
    words, storageKey, finishedTitle, finishedActions,
  } = props;
  const { t } = useTranslation();
  const session = useCycleSession(words, storageKey);

  if (!words.length) {
    return <Empty description={t('Нет слов для заучивания')} />;
  }

  if (session.phase === 'finished') {
    return (
      <VStack max gap="16" align="center">
        <Result
          status="success"
          title={finishedTitle}
          subTitle={t('Слов: {{count}}, ошибок: {{wrong}}', {
            count: session.total,
            wrong: session.wrongCount,
          })}
          extra={(
            <HStack gap="8" justify="center" wrap>
              {finishedActions}
              <Button onClick={session.restart}>
                {t('Пройти заново')}
              </Button>
            </HStack>
          )}
        />
        {session.mistakeWords.length > 0 && (
          <List
            className={cls.mistakes}
            header={<MyTypography.Base strong>{t('Слова с ошибками')}</MyTypography.Base>}
            bordered
            dataSource={session.mistakeWords}
            renderItem={(word) => (
              <List.Item>
                <MyTypography.Base strong>{word.term}</MyTypography.Base>
                <MyTypography.Base type="secondary">{word.translation}</MyTypography.Base>
              </List.Item>
            )}
          />
        )}
      </VStack>
    );
  }

  return (
    <VStack max gap="24" align="center">
      <VStack max gap="4" className={cls.progressRow}>
        <HStack max justify="between" align="center">
          <MyTypography.Small type="secondary">
            {t('Проход {{pass}} из {{passes}}', { pass: session.pass + 1, passes: session.passesCount })}
            {' · '}
            {session.direction === 'en-ru' ? 'EN → RU' : 'RU → EN'}
          </MyTypography.Small>
          <MyTypography.Small type="secondary">
            {session.done} / {session.total}
            {' · '}
            {t('ошибок: {{count}}', { count: session.wrongCount })}
          </MyTypography.Small>
        </HStack>
        <Progress percent={(session.done / session.total) * 100} showInfo={false} />
      </VStack>

      <div className={cls.stage}>
        {session.phase === 'feedback' && session.currentWord && session.lastGrade && (
          <CycleFeedback
            word={session.currentWord}
            grade={session.lastGrade}
            expected={session.expected}
            userInput={session.lastInput}
            onNext={session.next}
          />
        )}

        {session.phase === 'question' && session.currentWord && (
          <CyclePrompt
            questionKey={session.currentWord.uuid}
            prompt={session.prompt}
            expected={session.expected}
            direction={session.direction}
            onAnswer={session.answer}
          />
        )}
      </div>
    </VStack>
  );
};
