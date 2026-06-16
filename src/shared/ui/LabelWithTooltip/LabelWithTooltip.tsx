import { Tooltip } from "antd";
import { QuestionCircleOutlined } from '@ant-design/icons';
import { HStack } from "../Stack";
import { MyTypography } from "../MyTypography";

export const LabelWithTooltip = ({ value, tooltip }: { value: string, tooltip?: string }) => {

    return (
        <HStack gap="4">
            <MyTypography.Base ellipsis>
                {value}
            </MyTypography.Base>
            {tooltip && (
                <Tooltip title={tooltip}>
                    <QuestionCircleOutlined style={{ color: 'var(--color-icon-secondary)' }} />
                </Tooltip>
            )}
            <MyTypography.Base>
                :
            </MyTypography.Base>
        </HStack>
    )
}