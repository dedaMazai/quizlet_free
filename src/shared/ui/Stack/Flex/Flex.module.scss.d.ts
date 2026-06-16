export type Styles = {
  alignCenter: string;
  alignEnd: string;
  alignStart: string;
  directionColumn: string;
  directionRow: string;
  Flex: string;
  fullHeight: string;
  gap10: string;
  gap12: string;
  gap14: string;
  gap16: string;
  gap2: string;
  gap20: string;
  gap24: string;
  gap32: string;
  gap4: string;
  gap48: string;
  gap6: string;
  gap64: string;
  gap8: string;
  justifyAround: string;
  justifyBetween: string;
  justifyCenter: string;
  justifyEnd: string;
  justifyStart: string;
  max: string;
  wrap: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
