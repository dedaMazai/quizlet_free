import { memo, ReactNode } from 'react';
import { Modal } from 'antd';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { Drawer } from '@/shared/ui/Drawer';
import { MODAL_MOTION } from '@/shared/const/motion';
import { ModalHeader } from './ModalHeader';
import cls from './ModalFrame.module.scss';

interface ModalFrameProps {
    open: boolean;
    onClose: () => void;
    width: number | string;
    kicker?: ReactNode;
    title: ReactNode;
    quota?: ReactNode;
    /** Подпись слева в футере */
    footerNote?: ReactNode;
    /** Кнопки справа в футере */
    actions?: ReactNode;
    destroyOnHidden?: boolean;
    children: ReactNode;
}

/**
 * Модалка редизайна: рамка с метками Blueprint, своя шапка и футер (Modals 6.27–6.30).
 * На мобильном — шторка снизу (Mobile 6.37).
 */
export const ModalFrame = memo((props: ModalFrameProps) => {
    const {
        open, onClose, width, kicker, title, quota, footerNote, actions, destroyOnHidden, children,
    } = props;
    const { isMobile } = useMatchMedia();

    if (isMobile) {
        return (
            <Drawer isOpen={open} onClose={onClose}>
                <ModalHeader
                    kicker={kicker}
                    title={title}
                    quota={quota}
                    onClose={onClose}
                    className={cls.sheetHeader}
                />
                <div className={cls.sheetBody}>{children}</div>
                {(footerNote || actions) && (
                    <div className={cls.sheetFooter}>
                        {footerNote && <span className={cls.note}>{footerNote}</span>}
                        <div className={cls.sheetActions}>{actions}</div>
                    </div>
                )}
            </Drawer>
        );
    }

    return (
        <Modal
            {...MODAL_MOTION}
            open={open}
            width={width}
            title={null}
            footer={null}
            closable={false}
            onCancel={onClose}
            destroyOnHidden={destroyOnHidden}
            classNames={{ container: cls.container, body: cls.body }}
            modalRender={(node) => (
                <div className={cls.frame}>
                    <BlueprintMarks />
                    {node}
                </div>
            )}
        >
            <ModalHeader kicker={kicker} title={title} quota={quota} onClose={onClose} />
            {children}
            <div className={cls.footer}>
                <span className={cls.note}>{footerNote}</span>
                <div className={cls.actions}>{actions}</div>
            </div>
        </Modal>
    );
});

ModalFrame.displayName = 'ModalFrame';
