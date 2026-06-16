import { PropsWithChildren } from 'react';
import { Typography as AntTypography } from 'antd';
import { TextProps as AntTypographyProps } from 'antd/es/typography/Text';
import { LinkProps as AntLinkProps } from 'antd/es/typography/Link';
import { ParagraphProps } from 'antd/es/typography/Paragraph';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './Typography.module.scss';

const TypographySmall = ({
  children,
  className,
  ...props
}: PropsWithChildren<AntTypographyProps>) => {
  return (
    <AntTypography.Text
      className={classNames(cls.small, className)}
      {...props}
    >
      {children}
    </AntTypography.Text>
  );
};

const TypographyExtraLarge = ({
  children,
  className,
  ...props
}: PropsWithChildren<AntTypographyProps>) => {
  return (
    <AntTypography.Text
      className={classNames(cls.extraLarge, className)}
      {...props}
    >
      {children}
    </AntTypography.Text>
  );
};

const TypographyLarge = ({
  children,
  className,
  ...props
}: PropsWithChildren<AntTypographyProps>) => {
  return (
    <AntTypography.Text
      className={classNames(cls.large, className)}
      {...props}
    >
      {children}
    </AntTypography.Text>
  );
};

const TypographyBase = ({
  children,
  className,
  ...props
}: PropsWithChildren<ParagraphProps>) => {
  return (
    <AntTypography.Paragraph
      className={classNames(cls.base, className)}
      {...props}
    >
      {children}
    </AntTypography.Paragraph>
  );
};

const TypographyLink = ({
  children,
  className,
  ...props
}: PropsWithChildren<AntLinkProps> & AntTypographyProps) => {
  return (
    <AntTypography.Link className={classNames(cls.large, className)} {...props}>
      {children}
    </AntTypography.Link>
  );
};

export { TypographySmall, TypographyLarge, TypographyExtraLarge, TypographyBase, TypographyLink };


