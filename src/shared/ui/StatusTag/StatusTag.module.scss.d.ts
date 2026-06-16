export type Styles = {
  default: string;
  purple: string;
  StatusTag: string;
  success: string;
  warning: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
