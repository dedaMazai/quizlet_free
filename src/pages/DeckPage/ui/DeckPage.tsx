import {
  ReactNode, useEffect, useMemo, useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button, Dropdown, Empty, Input, MenuProps, Segmented, Tooltip,
} from 'antd';
import {
  ArrowRight,
  Copy,
  CopyMinus,
  Download,
  Ellipsis,
  FilePlusCorner,
  LayoutGrid,
  Layers,
  Lightbulb,
  PenLine,
  Play,
  Plus,
  Search,
  Sparkles,
  Star,
  UserMinus,
  Users,
} from 'lucide-react';
import {
  useGetDeckQuery,
  useDuplicateDeckMutation,
  useRemoveDeckShareMutation,
  pushRecentDeck,
} from '@/entities/Deck';
import { useUserInfo, useUserAccesses } from '@/entities/User';
import {
  AiQuotaNotice,
  CardType,
  DueCard,
  isDue,
  useAiQuota,
  useGetCardsQuery,
  useGetCardReviewsQuery,
  useGetFavoritesQuery,
  findDuplicateGroups,
} from '@/entities/Card';
import { CardList } from '@/widgets/CardList';
import { CardEditor } from '@/features/CardEditor';
import { ShareDeckModal } from '@/features/ShareDeck';
import { DuplicateCardsModal } from '@/features/DuplicateCardsModal';
import { CheckTranslationsModal } from '@/features/CheckTranslationsAI';
import { GenerateChunksModal } from '@/features/GenerateChunksAI';
import { useDeckExport, ExportFormat } from '@/features/ExportDeck';
import { ROUND_SIZE } from '@/features/LearnSession';
import { AccentPanel } from '@/shared/ui/AccentPanel';
import { BackBar } from '@/shared/ui/BackBar';
import { BackLink } from '@/shared/ui/BackLink';
import { Blueprint } from '@/shared/ui/Blueprint';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { MasteryBar, MasteryBarSize } from '@/shared/ui/MasteryBar';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import { Accesses } from '@/shared/types/accesses';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useToast } from '@/shared/lib/toast';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { recommendMode, StudyMode, STUDY_MODES } from '../model/recommendMode';
import cls from './DeckPage.module.scss';

const ICON_STROKE = 1.5;
const BUTTON_ICON_SIZE = 16;
const MODE_ICON_SIZE = 20;
const SMALL_ICON_SIZE = 14;
const SEARCH_ICON_SIZE = 15;
const MORE_ICON_SIZE = 18;
const PERCENT = 100;
// Mobile 6.36
const MOBILE_BAR_ICON_SIZE = 20;
const MOBILE_MODE_ICON_SIZE = 18;
const MOBILE_SEARCH_ICON_SIZE = 18;
const PLAY_ICON_SIZE = 20;

type MenuClick = NonNullable<MenuProps['onClick']>;

const toPercent = (part: number, total: number): number => (
  total > 0 ? Math.round((part / total) * PERCENT) : 0
);

interface ModeInfo {
  icon: ReactNode;
  name: string;
  desc: string;
  meta: string;
  path: string;
  disabled?: boolean;
}

const DeckPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { deckId } = useParams();
  const userInfo = useUserInfo();
  const [formOpen, setFormOpen] = useState(false);
  const [importOnOpen, setImportOnOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [chunksOpen, setChunksOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isMobile } = useMatchMedia();

  const { data: deck, isLoading } = useGetDeckQuery(deckId!, { skip: !deckId });

  // Недавние колоды для палитры ⌘K — только реально открытые (не 404)
  useEffect(() => {
    if (deck?.uuid) pushRecentDeck(deck.uuid);
  }, [deck?.uuid]);
  const [duplicateDeck, { isLoading: isDuplicating }] = useDuplicateDeckMutation();
  const [removeShare, { isLoading: isLeaving }] = useRemoveDeckShareMutation();
  const { data: cards } = useGetCardsQuery(deckId!, { skip: !deckId });
  const { data: reviews } = useGetCardReviewsQuery(deckId!, { skip: !deckId });
  const { data: favorites } = useGetFavoritesQuery();
  const { isExhausted: aiExhausted } = useAiQuota();
  const userAccesses = useUserAccesses();
  const dupCount = useMemo(() => findDuplicateGroups(cards ?? []).length, [cards]);
  const favCount = useMemo(
    () => (cards ?? []).filter((card) => favorites?.includes(card.uuid)).length,
    [cards, favorites],
  );

  // Слова вместе с состоянием повторения: статус в таблице и полоса освоения.
  const items = useMemo<DueCard[]>(() => {
    const reviewByUuid = new Map((reviews ?? []).map((review) => [review.card_uuid, review]));
    return (cards ?? []).map((card) => ({ card, review: reviewByUuid.get(card.uuid) ?? null }));
  }, [cards, reviews]);

  const stats = useMemo(() => {
    const now = new Date();
    let mastered = 0;
    let learning = 0;
    let due = 0;
    let phrases = 0;
    let examples = 0;
    items.forEach(({ card, review }) => {
      if (review?.level === 2) mastered += 1;
      if (review?.level === 1) learning += 1;
      if (review && isDue(review, now)) due += 1;
      if (card.card_type === 'phrase') phrases += 1;
      if (card.example) examples += 1;
    });
    return {
      total: items.length,
      mastered,
      learning,
      fresh: items.length - mastered - learning,
      due,
      phrases,
      examples,
    };
  }, [items]);

  const [search, debouncedSearch, , setSearchDebounced] = useDebounceState('');
  const [typeFilterState, setTypeFilter] = useState<CardType | 'all'>('all');
  const [onlyFavoritesState, setOnlyFavorites] = useState(false);
  // На мобильном переключателей фильтров нет — выбранные на широком экране не действуют
  const typeFilter = isMobile ? 'all' : typeFilterState;
  const onlyFavorites = !isMobile && onlyFavoritesState;
  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const favSet = new Set(favorites ?? []);
    return items.filter(({ card }) => {
      if (typeFilter !== 'all' && card.card_type !== typeFilter) return false;
      if (onlyFavorites && !favSet.has(card.uuid)) return false;
      if (!query) return true;
      return card.term.toLowerCase().includes(query)
        || card.translation.toLowerCase().includes(query)
        || (card.example?.toLowerCase().includes(query) ?? false);
    });
  }, [items, debouncedSearch, typeFilter, onlyFavorites, favorites]);
  const hasSearch = Boolean(debouncedSearch.trim());
  const { exportDeck, exporting, disabled: exportDisabled } = useDeckExport(
    deckId ?? '',
    deck?.name ?? '',
  );

  if (!deckId) return null;
  if (isLoading) return <Loader />;
  if (!deck) return <Empty description={t('Колода не найдена')} />;

  const isOwner = deck.is_owner;
  const isAdmin = userAccesses.includes(Accesses.administration);
  // Видимая чужая колода по RLS всегда расшарена с нами: правка слов доступна
  // владельцу, гостю при общем редактировании и админу.
  const canEditCards = isOwner || deck.allow_shared_edit || isAdmin;
  const authorLabel = deck.owner_name ?? deck.owner_email;

  const handleDuplicate = async () => {
    try {
      const copy = await duplicateDeck(deck).unwrap();
      toast.success(t('Колода скопирована'));
      navigate(RoutePath.DECK(copy.uuid));
    } catch {
      toast.error(t('Не удалось скопировать колоду'));
    }
  };

  const handleLeave = async () => {
    if (!userInfo) return;
    try {
      await removeShare({ deckUuid: deck.uuid, userId: userInfo.uuid }).unwrap();
      toast.success(t('Вы больше не видите эту колоду'));
      navigate(RoutePath.DECKS());
    } catch {
      toast.error(t('Не удалось убрать колоду'));
    }
  };

  // Режимы вынесены в сетку «Как учить»; в «…» — второстепенные действия.
  const moreItems: MenuProps['items'] = [
    {
      key: 'export',
      icon: <Download size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />,
      label: t('Экспорт'),
      disabled: exportDisabled,
      children: [
        { key: 'export:excel', label: t('Excel') },
        { key: 'export:json', label: t('JSON') },
        { key: 'export:markdown', label: t('Markdown') },
      ],
    },
    {
      key: 'learn-favorites',
      icon: <Star size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />,
      label: t('Заучивание избранного'),
      disabled: favCount === 0,
    },
    canEditCards && dupCount > 0
      ? {
        key: 'dedup',
        icon: <CopyMinus size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />,
        label: t('Дубли ({{count}})', { count: dupCount }),
      }
      : null,
    !isOwner
      ? {
        key: 'duplicate',
        icon: <Copy size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />,
        label: t('Дублировать'),
      }
      : null,
    !isOwner
      ? {
        key: 'leave',
        icon: <UserMinus size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />,
        label: t('Убрать из своих'),
      }
      : null,
  ].filter(Boolean);

  const handleMoreClick: MenuClick = ({ key }) => {
    if (key.startsWith('export:')) {
      exportDeck(key.split(':')[1] as ExportFormat);
      return;
    }
    if (key === 'learn-favorites') navigate(RoutePath.DECK_FAVORITES_LEARN(deckId));
    if (key === 'dedup') setDupOpen(true);
    if (key === 'duplicate') handleDuplicate();
    if (key === 'leave') handleLeave();
  };

  const aiItems: MenuProps['items'] = [
    { key: 'ai-check', label: t('Проверить переводы') },
    { key: 'ai-chunks', label: t('Подобрать фразы') },
  ];

  const handleAiClick: MenuClick = ({ key }) => {
    if (key === 'ai-check') setAiOpen(true);
    if (key === 'ai-chunks') setChunksOpen(true);
  };

  const recommended = recommendMode({
    newCount: stats.fresh,
    dueCount: stats.due,
    examplesCount: stats.examples,
  });

  const modeIconSize = isMobile ? MOBILE_MODE_ICON_SIZE : MODE_ICON_SIZE;
  const modes: Record<StudyMode, ModeInfo> = {
    [StudyMode.LEARN]: {
      icon: <Lightbulb size={modeIconSize} strokeWidth={ICON_STROKE} />,
      name: t('Заучивание'),
      desc: t('Выбор, затем ввод'),
      meta: t('Раунды по {{count}}', { count: ROUND_SIZE }),
      path: RoutePath.LEARN(deckId),
    },
    [StudyMode.WRITE]: {
      icon: <PenLine size={modeIconSize} strokeWidth={ICON_STROKE} />,
      name: t('Письмо'),
      desc: t('Ввод перевода в обе стороны'),
      meta: t('RU → EN · EN → RU'),
      path: RoutePath.WRITE(deckId),
    },
    [StudyMode.CLOZE]: {
      icon: <Sparkles size={modeIconSize} strokeWidth={ICON_STROKE} />,
      name: t('Пропуски'),
      desc: t('Слово скрыто в своём примере'),
      meta: t('{{count}} примеров', { count: stats.examples }),
      path: RoutePath.CLOZE(deckId),
      // Режим строится на поле «Пример»: без примеров пропуск делать не из чего.
      disabled: stats.examples === 0,
    },
    [StudyMode.ORDER]: {
      icon: <Layers size={modeIconSize} strokeWidth={ICON_STROKE} />,
      name: t('Собери фразу'),
      desc: t('Порядок слов на чанках'),
      meta: t('{{count}} фраз', { count: stats.phrases }),
      path: RoutePath.ORDER(deckId),
      // Собирать имеет смысл только фразы: одиночное слово собирать нечего.
      disabled: stats.phrases === 0,
    },
    [StudyMode.CARDS]: {
      icon: <LayoutGrid size={modeIconSize} strokeWidth={ICON_STROKE} />,
      name: t('Карточки'),
      desc: t('Знакомство, без записи прогресса'),
      meta: t('Просмотр'),
      path: RoutePath.FLASHCARDS(deckId),
    },
  };

  const learnDesc = stats.fresh > 0
    ? t('{{count}} новых слов — раунды по {{size}}: выбор, затем ввод', {
      count: stats.fresh, size: ROUND_SIZE,
    })
    : t('{{count}} слов к повторению — раунды по {{size}}: выбор, затем ввод', {
      count: stats.due, size: ROUND_SIZE,
    });
  const recommendedMode = modes[recommended];

  // Колода без слов: вместо режимов и списка — пустое состояние
  const isEmptyDeck = cards !== undefined && cards.length === 0;
  const emptyDeckState = (
    <EmptyState
      icon={FilePlusCorner}
      kicker={t('Колода пуста')}
      title={t('Добавьте 10–20 слов, чтобы начать')}
      description={t('Можно вводить вручную или загрузить таблицу Excel.')}
      primary={canEditCards ? { label: t('Добавить слова'), onClick: () => setFormOpen(true) } : undefined}
      secondary={canEditCards
        ? {
          label: t('Импорт'),
          onClick: () => {
            setImportOnOpen(true);
            setFormOpen(true);
          },
        }
        : undefined}
    />
  );

  const cardList = (
    <CardList
      deckUuid={deckId}
      readOnly={!canEditCards}
      items={filtered}
      emptyText={hasSearch || onlyFavorites || typeFilter !== 'all' ? t('Ничего не найдено') : undefined}
    />
  );

  const modals = (
    <>
      {canEditCards && (
        <>
          <CardEditor
            open={formOpen}
            deckUuid={deckId}
            openFilePicker={importOnOpen}
            onClose={() => {
              setFormOpen(false);
              setImportOnOpen(false);
            }}
          />
          <DuplicateCardsModal open={dupOpen} deckUuid={deckId} onClose={() => setDupOpen(false)} />
          <CheckTranslationsModal open={aiOpen} deckUuid={deckId} onClose={() => setAiOpen(false)} />
          <GenerateChunksModal
            open={chunksOpen}
            deckUuid={deckId}
            onClose={() => setChunksOpen(false)}
          />
        </>
      )}
      {isOwner && (
        <ShareDeckModal open={shareOpen} deckUuid={deckId} onClose={() => setShareOpen(false)} />
      )}
    </>
  );

  if (isMobile) {
    // В «…» на мобильном — всё, чего нет в макете: «Поделиться», ИИ и меню «Ещё»
    const mobileMenuItems: MenuProps['items'] = [
      isOwner
        ? {
          key: 'share',
          icon: <Users size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />,
          label: t('Поделиться'),
        }
        : null,
      ...(canEditCards
        ? [{
          key: 'ai',
          icon: <Sparkles size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />,
          label: t('ИИ: проверить и подобрать фразы'),
          // Лимит исчерпан — пункт недоступен до завтра
          disabled: aiExhausted,
          children: aiItems,
        }]
        : []),
      ...(moreItems ?? []),
    ].filter(Boolean);

    const handleMobileMenuClick: MenuClick = (info) => {
      if (info.key === 'share') setShareOpen(true);
      handleAiClick(info);
      handleMoreClick(info);
    };

    const toggleSearch = () => {
      if (searchOpen) setSearchDebounced('');
      setSearchOpen((prev) => !prev);
    };

    const recommendedMeta = recommended === StudyMode.LEARN
      ? `${stats.fresh > 0
        ? t('{{count}} новых', { count: stats.fresh })
        : t('{{count}} к повторению', { count: stats.due })} · ${recommendedMode.meta}`
      : recommendedMode.meta;

    return (
      <div className={cls.DeckPage}>
        <BackBar
          to={RoutePath.DECKS()}
          label={t('Библиотека')}
          actions={(
            <>
              {canEditCards && (
                <Button
                  type="text"
                  aria-label={t('Добавить слова')}
                  icon={<Plus size={MOBILE_BAR_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                  onClick={() => setFormOpen(true)}
                />
              )}
              <Dropdown
                trigger={['click']}
                placement="bottomRight"
                menu={{ items: mobileMenuItems, onClick: handleMobileMenuClick }}
              >
                <Button
                  type="text"
                  aria-label={t('Ещё')}
                  icon={<Ellipsis size={MOBILE_BAR_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                  loading={exporting || isDuplicating || isLeaving}
                />
              </Dropdown>
            </>
          )}
        />
        <div className={cls.mobileBody}>
          <div className={cls.mobileTitleBlock}>
            <Kicker size={KickerSize.SM}>
              {`${t('{{count}} слов', { count: stats.total })} · ${
                t('{{count}} фраз', { count: stats.phrases })}`}
            </Kicker>
            <h1 className={cls.mobileTitle}>{deck.name}</h1>
          </div>

          {isEmptyDeck ? emptyDeckState : (
            <>
              <div className={cls.mastery}>
                <MasteryBar
                  size={MasteryBarSize.LG}
                  className={cls.mobileBar}
                  mastered={toPercent(stats.mastered, stats.total)}
                  learning={toPercent(stats.learning, stats.total)}
                />
                <div className={cls.mobileLegend}>
                  <span>{t('Усвоено {{count}}', { count: stats.mastered })}</span>
                  <span>{t('Изучаю {{count}}', { count: stats.learning })}</span>
                  <span>{t('Новые {{count}}', { count: stats.fresh })}</span>
                </div>
              </div>

              <AccentPanel
                as="button"
                type="button"
                className={cls.mobileRecommended}
                onClick={() => navigate(recommendedMode.path)}
              >
                <span className={cls.mobileRecommendedText}>
                  <Kicker size={KickerSize.SM} tone={KickerTone.ON_DARK} className={cls.mobileRecommendedKicker}>
                    {t('Рекомендуем')}
                  </Kicker>
                  <span className={cls.mobileRecommendedName}>{recommendedMode.name}</span>
                  <span className={cls.mobileRecommendedMeta}>{recommendedMeta}</span>
                </span>
                <span className={cls.play}>
                  <Play aria-hidden size={PLAY_ICON_SIZE} strokeWidth={ICON_STROKE} />
                </span>
              </AccentPanel>

              <div className={cls.mobileModes}>
                {STUDY_MODES.filter((mode) => mode !== recommended).map((mode) => {
                  const info = modes[mode];
                  return (
                    <Blueprint
                      key={mode}
                      as="button"
                      type="button"
                      className={cls.mobileMode}
                      disabled={info.disabled}
                      onClick={() => navigate(info.path)}
                    >
                      <span className={cls.modeIcon}>{info.icon}</span>
                      <span className={cls.mobileModeName}>{info.name}</span>
                    </Blueprint>
                  );
                })}
              </div>

              <section className={cls.mobileWords}>
                <div className={cls.mobileWordsHead}>
                  <h2 className={cls.mobileWordsTitle}>{t('Слова')}</h2>
                  <Button
                    type="text"
                    className={cls.mobileSearchButton}
                    aria-label={t('Поиск в колоде')}
                    aria-pressed={searchOpen}
                    icon={<Search size={MOBILE_SEARCH_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                    onClick={toggleSearch}
                  />
                </div>
                {searchOpen && (
                  <Input
                    autoFocus
                    className={cls.mobileSearch}
                    prefix={<Search aria-hidden size={SEARCH_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                    allowClear
                    value={search}
                    placeholder={t('Поиск в колоде')}
                    onChange={(e) => setSearchDebounced(e.target.value)}
                  />
                )}
                {cardList}
              </section>
            </>
          )}
        </div>
        {modals}
      </div>
    );
  }

  return (
    <div className={cls.DeckPage}>
      <header className={cls.header}>
        <BackLink
          items={[
            { label: t('Библиотека'), to: RoutePath.DECKS() },
            { label: t('Колоды'), to: RoutePath.DECKS() },
          ]}
        />
        <div className={cls.titleRow}>
          <div className={cls.titleBlock}>
            <Kicker>
              {`${t('Колода')} · ${t('{{count}} слов', { count: stats.total })} · ${
                t('{{count}} фраз', { count: stats.phrases })}`}
            </Kicker>
            <h1 className={cls.title}>{deck.name}</h1>
            {(deck.description || (!isOwner && authorLabel)) && (
              <div className={cls.description}>
                {deck.description}
                {!isOwner && authorLabel && (
                  <span className={cls.author}>{t('от {{author}}', { author: authorLabel })}</span>
                )}
              </div>
            )}
          </div>
          <div className={cls.actions}>
            {isOwner && (
              <Button
                className={cls.headerButton}
                icon={<Users size={BUTTON_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={() => setShareOpen(true)}
              >
                {t('Поделиться')}
              </Button>
            )}
            {canEditCards && (
              <Button
                className={cls.headerButton}
                icon={<Plus size={BUTTON_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={() => setFormOpen(true)}
              >
                {t('Слова')}
              </Button>
            )}
            <Dropdown
              trigger={['click']}
              menu={{ items: moreItems, onClick: handleMoreClick }}
            >
              <Button
                className={cls.moreButton}
                aria-label={t('Ещё')}
                icon={<Ellipsis size={MORE_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                loading={exporting || isDuplicating || isLeaving}
              />
            </Dropdown>
          </div>
        </div>
        <div className={cls.mastery}>
          <MasteryBar
            size={MasteryBarSize.LG}
            mastered={toPercent(stats.mastered, stats.total)}
            learning={toPercent(stats.learning, stats.total)}
          />
          <div className={cls.legend}>
            <span className={cls.legendItem}>
              <i className={classNames(cls.legendMark, [cls.mastered])} />
              {t('Усвоено {{count}}', { count: stats.mastered })}
            </span>
            <span className={cls.legendItem}>
              <i className={classNames(cls.legendMark, [cls.learning])} />
              {t('Изучаю {{count}}', { count: stats.learning })}
            </span>
            <span className={cls.legendItem}>
              <i className={classNames(cls.legendMark, [cls.fresh])} />
              {t('Новые {{count}}', { count: stats.fresh })}
            </span>
            {stats.due > 0 && (
              <span className={cls.due}>{t('{{count}} к повторению', { count: stats.due })}</span>
            )}
          </div>
        </div>
      </header>

      {isEmptyDeck ? emptyDeckState : (
        <>
          <section className={cls.section}>
            <SectionHeader title={t('Как учить')} />
            <div className={cls.modes}>
              <AccentPanel
                as="button"
                type="button"
                className={cls.recommended}
                onClick={() => navigate(recommendedMode.path)}
              >
                <div className={cls.recommendedHead}>
                  <Kicker size={KickerSize.SM} tone={KickerTone.ON_DARK}>{t('Рекомендуем')}</Kicker>
                  {recommendedMode.icon}
                </div>
                <span className={cls.recommendedName}>{recommendedMode.name}</span>
                <span className={cls.recommendedDesc}>
                  {recommended === StudyMode.LEARN ? learnDesc : recommendedMode.desc}
                </span>
                <span className={cls.recommendedStart}>
                  {t('Начать')}
                  <ArrowRight aria-hidden size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />
                </span>
              </AccentPanel>
              {STUDY_MODES.filter((mode) => mode !== recommended).map((mode) => {
                const info = modes[mode];
                return (
                  <Blueprint
                    key={mode}
                    as="button"
                    type="button"
                    className={cls.mode}
                    disabled={info.disabled}
                    onClick={() => navigate(info.path)}
                  >
                    <span className={cls.modeIcon}>{info.icon}</span>
                    <span className={cls.modeName}>{info.name}</span>
                    <span className={cls.modeDesc}>{info.desc}</span>
                    <span className={cls.modeMeta}>{info.meta}</span>
                  </Blueprint>
                );
              })}
            </div>
          </section>

          <section className={cls.section}>
            <div className={cls.toolbar}>
              <h2 className={cls.wordsTitle}>{t('Слова')}</h2>
              <Input
                className={cls.search}
                prefix={<Search aria-hidden size={SEARCH_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                allowClear
                value={search}
                placeholder={t('Поиск в колоде')}
                onChange={(e) => setSearchDebounced(e.target.value)}
              />
              <Segmented<CardType | 'all'>
                className={cls.segmented}
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { label: t('Все'), value: 'all' },
                  { label: t('Слова'), value: 'word' },
                  { label: t('Фразы'), value: 'phrase' },
                ]}
              />
              <Button
                className={classNames(cls.favButton, [], { [cls.favButtonActive]: onlyFavorites })}
                aria-pressed={onlyFavorites}
                icon={<Star size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={() => setOnlyFavorites((prev) => !prev)}
              >
                {t('Избранные')}
              </Button>
              {canEditCards && aiExhausted && (
                <Tooltip title={t('Лимит обновится завтра')}>
                  <Button
                    disabled
                    type="link"
                    className={cls.aiButton}
                    icon={<Sparkles size={BUTTON_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                  >
                    {t('ИИ: проверить и подобрать фразы')}
                  </Button>
                </Tooltip>
              )}
              {canEditCards && !aiExhausted && (
                <Dropdown
                  trigger={['click']}
                  placement="bottomRight"
                  menu={{ items: aiItems, onClick: handleAiClick }}
                >
                  <Button
                    type="link"
                    className={cls.aiButton}
                    icon={<Sparkles size={BUTTON_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                  >
                    {t('ИИ: проверить и подобрать фразы')}
                  </Button>
                </Dropdown>
              )}
            </div>
            {canEditCards && <AiQuotaNotice />}

            {cardList}
          </section>
        </>
      )}

      {modals}
    </div>
  );
};

export default DeckPage;
