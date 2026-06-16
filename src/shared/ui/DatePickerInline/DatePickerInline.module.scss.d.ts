export type Styles = {
  control: string;
  output: string;
  root: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
