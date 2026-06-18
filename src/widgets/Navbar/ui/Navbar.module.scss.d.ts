export type Styles = {
  dropDown: string;
  dropDownItem: string;
  FAQButton: string;
  menu: string;
  menuWrap: string;
  Navbar: string;
  profileCard: string;
  rootClassName: string;
  tabs: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
