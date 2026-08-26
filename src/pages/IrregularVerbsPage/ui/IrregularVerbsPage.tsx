import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Card, Input, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { RoutePath } from '@/shared/config/router/routePath';
import { IrregularVerb, VERB_BANDS } from '@/shared/const/grammar';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useImportVerbsDeck } from '../model/useImportVerbsDeck';

import cls from './IrregularVerbsPage.module.scss';

const { Title, Text } = Typography;

const IrregularVerbsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { importBand, importingBand, findExistingDeck } = useImportVerbsDeck();

    const columns: ColumnsType<IrregularVerb> = useMemo(() => [
        {
            title: 'V1',
            dataIndex: 'base',
            render: (value: string) => <Text strong>{value}</Text>,
        },
        {
            title: 'V2',
            dataIndex: 'past',
        },
        {
            title: 'V3',
            dataIndex: 'participle',
        },
        {
            title: t('Перевод'),
            dataIndex: 'translation',
            render: (value: string) => <Text type="secondary">{value}</Text>,
        },
    ], [t]);

    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = (verb: IrregularVerb): boolean => (
        !normalizedSearch
        || verb.base.toLowerCase().includes(normalizedSearch)
        || verb.past.toLowerCase().includes(normalizedSearch)
        || verb.participle.toLowerCase().includes(normalizedSearch)
        || verb.translation.toLowerCase().includes(normalizedSearch)
    );

    return (
        <VStack max gap="24" className={cls.IrregularVerbsPage}>
            <VStack max gap="8">
                <Title level={1}>{t('Неправильные глаголы')}</Title>
                <MyTypography.Large type="secondary">
                    {t('Три формы самых частотных неправильных глаголов. Создайте колоду из группы и учите формы в привычных режимах: карточки, выбор, письмо.')}
                </MyTypography.Large>
            </VStack>

            <Input
                allowClear
                placeholder={t('Поиск по форме или переводу')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={cls.search}
            />

            {VERB_BANDS.map((band) => {
                const visibleVerbs = band.verbs.filter(matchesSearch);
                if (normalizedSearch && visibleVerbs.length === 0) return null;

                const existingDeck = findExistingDeck(band);

                return (
                    <Card
                        key={band.index}
                        className={cls.bandCard}
                        title={t('Глаголы {{from}}–{{to}}', { from: band.from, to: band.to })}
                        extra={existingDeck ? (
                            <Button onClick={() => navigate(RoutePath.DECK(existingDeck.uuid))}>
                                {t('Открыть колоду')}
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                loading={importingBand === band.index}
                                disabled={importingBand !== null && importingBand !== band.index}
                                onClick={() => importBand(band)}
                            >
                                {t('Создать колоду ({{count}} карточек)', { count: band.verbs.length })}
                            </Button>
                        )}
                    >
                        <Table<IrregularVerb>
                            size="small"
                            rowKey="base"
                            columns={columns}
                            dataSource={visibleVerbs}
                            pagination={false}
                        />
                    </Card>
                );
            })}

            <HStack max gap="8">
                <Text type="secondary">
                    {t('Совет: в режиме «Письмо» вводите все три формы через пробел — например, «go went gone».')}
                </Text>
            </HStack>
        </VStack>
    );
};

export default IrregularVerbsPage;
