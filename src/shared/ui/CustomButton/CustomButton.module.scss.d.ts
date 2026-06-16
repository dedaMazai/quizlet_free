export type Styles = {
  accept: string;
  CustomButton: string;
  default: string;
  delegate: string;
  reject: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
