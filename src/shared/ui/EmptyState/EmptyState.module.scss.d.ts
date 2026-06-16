export type Styles = {
  actionButton: string;
  description: string;
  EmptyState: string;
  iconBg: string;
  iconWrapper: string;
  large: string;
  medium: string;
  small: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
