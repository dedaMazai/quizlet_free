import { useTranslation } from 'react-i18next';
import {
    Breadcrumb,
} from 'antd';
import {
    NavLink,
    useParams,
} from 'react-router';
import Icon from '@ant-design/icons';
import { useGetUserQuery, useUserInfo } from '@/entities/User';
import { useGetDeckQuery } from '@/entities/Deck';
import { RoutePath } from '@/shared/config/router/routePath';
import { MyTypography } from '@/shared/ui/MyTypography';
import { ReactComponent as Home } from '@/shared/assets/icons/Home.svg';
import { HStack } from '@/shared/ui/Stack';
import { buildName } from '@/shared/lib/helpers/buildName';

type CrumbType = 'user' | 'deck';

export type Crumb = {
    path: (value?: string) => string;
    label: string;
    type?: CrumbType;
};

export const BreadcrumbsCustom = ({ breadcrumbs }: { breadcrumbs: Crumb[] }) => {
    const { t } = useTranslation();
    const userInfo = useUserInfo();
    const {
        id_user: userUuid,
        deckId,
    } = useParams();

    const { data: user } = useGetUserQuery(userUuid!, {
        skip: !userUuid,
    });

    const { data: deck } = useGetDeckQuery(deckId!, {
        skip: !deckId,
    });

    const createLabel = (label: string, type?: CrumbType) => {
        if (type === 'user') {
            return (
                (user?.name && user.surname)
                    ? buildName({
                        surname: user.surname,
                        name: user.name,
                        middle_name: user.middle_name,
                        language: userInfo?.language
                    })
                    : user?.email || label
            )
        }

        if (type === 'deck') {
            return deck?.name || label
        }

        return label
    }

    const breadcrumbsItems = breadcrumbs.map(({ path, label, type }, index) => {
        const pathTo = path();
        const labelText = String(createLabel(label, type));

        return ({
            title: (
                <NavLink to={pathTo} key={index}>
                    <MyTypography.Base type="secondary">
                        {t(labelText)}
                    </MyTypography.Base>
                </NavLink>
            ),
        })
    });

    breadcrumbsItems.unshift({
        title: (
            <NavLink to={RoutePath.MAIN()}>
                <HStack gap="6">
                    <Icon component={Home} />
                    <MyTypography.Base type="secondary">
                        {t('Главная')}
                    </MyTypography.Base>
                </HStack>
            </NavLink>
        ),
    })

    return (
        <Breadcrumb
            style={{
                flexShrink: 0,
            }}
            separator="/"
            items={breadcrumbsItems}
        />
    )
}
