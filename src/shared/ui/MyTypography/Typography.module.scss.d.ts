export type Styles = {
  base: string;
  extraLarge: string;
  large: string;
  small: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
