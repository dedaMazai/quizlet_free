import { Accesses } from "@/shared/types/accesses";

type ValueWithAccess<T> = T & {
  accesses?: string[]
};

export const filterValuesForAccess = <T>(values: ValueWithAccess<T>[], currentAccesses?: string[]):T[] => values
  .filter(({ accesses }) => (accesses
    ? accesses.some((access) => !!currentAccesses?.find((value) => value === access || value === Accesses.administration))
    : true))
  .map(({
    accesses, ...rest
  }) => rest as T);
