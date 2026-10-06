import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { LEGAL_VERSION } from '@/shared/const/legal';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';

import { EN_DOCUMENTS } from '../model/documents/en';
import { RU_DOCUMENTS } from '../model/documents/ru';
import { LegalBlock, LegalDocumentId } from '../model/types';
import cls from './LegalPage.module.scss';

interface LegalPageProps {
    document: LegalDocumentId;
}

const DOCUMENT_PATHS: Record<LegalDocumentId, string> = {
    [LegalDocumentId.TERMS]: RoutePath.TERMS(),
    [LegalDocumentId.PRIVACY]: RoutePath.PRIVACY(),
    [LegalDocumentId.CONSENT]: RoutePath.PD_CONSENT(),
};

const DOCUMENT_ORDER = [LegalDocumentId.TERMS, LegalDocumentId.PRIVACY, LegalDocumentId.CONSENT];

const renderBlock = (block: LegalBlock, key: number) => {
    if (typeof block === 'string') {
        return <p key={key} className={cls.paragraph}>{block}</p>;
    }
    return (
        <ul key={key} className={cls.list}>
            {block.list.map((item) => <li key={item}>{item}</li>)}
        </ul>
    );
};

/** Юридический документ: соглашение, политика обработки ПДн или согласие. Русская редакция — основная */
const LegalPage = ({ document: documentId }: LegalPageProps) => {
    const { t, i18n } = useTranslation();
    const { hash } = useLocation();
    const isEnglish = i18n.language.startsWith('en');
    const documents = isEnglish ? EN_DOCUMENTS : RU_DOCUMENTS;
    const doc = documents[documentId];

    const editionDate = useMemo(
        () => new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })
            .format(new Date(LEGAL_VERSION)),
        [i18n.language],
    );

    const tabTitles: Record<LegalDocumentId, string> = {
        [LegalDocumentId.TERMS]: t('Соглашение'),
        [LegalDocumentId.PRIVACY]: t('Конфиденциальность'),
        [LegalDocumentId.CONSENT]: t('Согласие на обработку'),
    };

    // Якорь раздела из оглавления или прямой ссылки
    useEffect(() => {
        if (hash) window.document.getElementById(hash.slice(1))?.scrollIntoView();
    }, [hash, documentId]);

    return (
        <div className={cls.LegalPage}>
            <header className={cls.head}>
                <Kicker tone={KickerTone.ACCENT}>{t('Редакция от {{date}}', { date: editionDate })}</Kicker>
                <h1 className={cls.title}>{doc.title}</h1>
                <nav className={cls.tabs} aria-label={t('Документы')}>
                    {DOCUMENT_ORDER.map((id) => (
                        <Link
                            key={id}
                            to={DOCUMENT_PATHS[id]}
                            className={classNames(cls.tab, { [cls.tabActive]: id === documentId })}
                            aria-current={id === documentId ? 'page' : undefined}
                        >
                            {tabTitles[id]}
                        </Link>
                    ))}
                </nav>
            </header>

            <div className={cls.body}>
                <nav className={cls.toc} aria-label={t('Содержание')}>
                    <Kicker>{t('Содержание')}</Kicker>
                    <ol className={cls.tocList}>
                        {doc.sections.map((section) => (
                            <li key={section.id}>
                                <a href={`#${section.id}`} className={cls.tocLink}>{section.title}</a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <article className={cls.article}>
                    {doc.intro.map((text) => <p key={text} className={cls.intro}>{text}</p>)}
                    {doc.sections.map((section) => (
                        <section key={section.id} id={section.id} className={cls.section}>
                            <h2 className={cls.sectionTitle}>{section.title}</h2>
                            {section.blocks.map(renderBlock)}
                        </section>
                    ))}
                </article>
            </div>
        </div>
    );
};

export default LegalPage;
