export type Styles = {
  button: string;
  description: string;
  devDetails: string;
  devTitle: string;
  errorId: string;
  ErrorPage: string;
  hint: string;
  iconBox: string;
  stackDetails: string;
  stackTrace: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
