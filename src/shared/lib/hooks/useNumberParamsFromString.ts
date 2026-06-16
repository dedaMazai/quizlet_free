import { useMemo } from "react";

export const useNumberParamsFromString = (value?: string) => (
    useMemo(() => (
        value && value.split(',').length
            ? value.split(',').filter(Number).map(Number)
            : []
    ), [value])
);