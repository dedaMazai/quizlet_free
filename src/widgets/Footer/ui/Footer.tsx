import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './Footer.module.scss';

interface FooterProps {
    className?: string;
}

export const Footer = (props: FooterProps) => {
    const { className } = props;

    return (
        <footer className={classNames(cls.Footer, {}, [className])}>
            teeest
        </footer>
    );
};
