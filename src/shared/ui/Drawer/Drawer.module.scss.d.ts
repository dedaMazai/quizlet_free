export type Styles = {
  content: string;
  Drawer: string;
  drawerNew: string;
  opened: string;
  sheet: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
