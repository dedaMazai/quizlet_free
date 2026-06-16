export type Styles = {
  alertTitle: string;
  devAlert: string;
  errorIdAlert: string;
  ErrorPage: string;
  stackDetails: string;
  stackTrace: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
