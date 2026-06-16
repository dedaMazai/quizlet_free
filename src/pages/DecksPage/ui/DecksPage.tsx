import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DeckList } from '@/widgets/DeckList';
import { DeckForm } from '@/features/DeckForm';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';

const DecksPage = () => {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <VStack max fullHeight gap="16">
      <HStack max justify="between" align="center">
        <MyTypography.Large strong>{t('Колоды')}</MyTypography.Large>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          {t('Создать колоду')}
        </Button>
      </HStack>

      <DeckList />

      <DeckForm open={formOpen} onClose={() => setFormOpen(false)} />
    </VStack>
  );
};

export default DecksPage;
