const currencyMap = {
  dollar: "$",
  euro: "€",
  dram: "֏",
  rupee: "₹",
  ruble: "₽",
};

export const amountFormat = (number: number, currency?: "dollar" | "euro" | "dram" | "rupee" | "ruble") => {
  const result = String(number).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return `${result} ${currency ? currencyMap[currency] : ''}`;
};
