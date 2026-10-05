import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DeckList } from '@/widgets/DeckList';
import { DeckForm } from '@/features/DeckForm';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { VStack } from '@/shared/ui/Stack';

const DecksPage = () => {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <VStack max fullHeight gap="16">
      <SectionPageHeader
        section={NavSectionKey.LIBRARY}
        extra={(
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
            {t('Создать колоду')}
          </Button>
        )}
      />

      <DeckList />

      <DeckForm open={formOpen} onClose={() => setFormOpen(false)} />
    </VStack>
  );
};

export default DecksPage;
