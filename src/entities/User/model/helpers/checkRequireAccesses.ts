import { Accesses } from "@/shared/types/accesses";

export const checkRequireAccesses = ({ accesses, userAccesses }: {
  accesses?: Accesses[]
  userAccesses?: Accesses[]
}) => {
  if (!accesses) {
    return true;
  }

  return accesses.some((requiredAccesses) => {
    const hasAccesses = !!userAccesses?.find((value) => value === requiredAccesses || value === Accesses.administration);

    return hasAccesses;
  });
}
