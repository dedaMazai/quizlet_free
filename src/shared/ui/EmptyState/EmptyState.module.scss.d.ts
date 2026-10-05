export type Styles = {
  actions: string;
  center: string;
  description: string;
  EmptyState: string;
  icon: string;
  kicker: string;
  primary: string;
  secondary: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
