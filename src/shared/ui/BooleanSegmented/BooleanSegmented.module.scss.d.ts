export type Styles = {
  BooleanSegmented: string;
  negative: string;
  positive: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
