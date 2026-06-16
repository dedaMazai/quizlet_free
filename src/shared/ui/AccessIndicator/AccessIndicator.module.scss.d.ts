export type Styles = {
  AccessIndicator: string;
  medium: string;
  private: string;
  read: string;
  small: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
