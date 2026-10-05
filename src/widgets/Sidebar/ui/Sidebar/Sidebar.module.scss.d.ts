export type Styles = {
  active: string;
  badge: string;
  bottom: string;
  collapseBtn: string;
  collapsed: string;
  dot: string;
  header: string;
  icon: string;
  item: string;
  label: string;
  logo: string;
  logoIcon: string;
  logoText: string;
  nav: string;
  Sidebar: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
