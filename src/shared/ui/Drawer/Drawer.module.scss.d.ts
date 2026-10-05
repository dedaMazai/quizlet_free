export type Styles = {
  Drawer: string;
  handle: string;
  handleRow: string;
  scrim: string;
  sheet: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
