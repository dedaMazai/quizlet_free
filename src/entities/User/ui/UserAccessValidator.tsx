import { useMemo, ReactNode } from 'react';
import { useUserAccesses } from '../model/selectors/getUserData';
import { Accesses } from '@/shared/types/accesses';
import { checkRequireAccesses } from '../model/helpers/checkRequireAccesses';

interface UserAccessValidatorProps {
  children: ReactNode
  accesses?: Accesses[]
  skip?: boolean
}

export const UserAccessValidator = ({
  children,
  accesses,
  skip,
}: UserAccessValidatorProps) => {
  const userAccesses = useUserAccesses();
  const hasRequireAccesses = useMemo(() => checkRequireAccesses({ accesses, userAccesses }), [accesses, userAccesses]);


  if (!hasRequireAccesses && !skip) {
    return null;
  }

  return children;
};
