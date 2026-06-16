export type Styles = {
  badge: string;
  CardNotification: string;
  checker: string;
  closeBtn: string;
  header: string;
  list: string;
  textBtn: string;
  triggerBtn: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
