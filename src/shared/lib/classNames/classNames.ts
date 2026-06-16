export type ClassPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined;

export type ClassArgument =
  | ClassPrimitive
  | Record<string, ClassPrimitive>
  | ClassArgument[];

export const classNames = (...args: ClassArgument[]): string => {
  let resultString = '';

  const addClassToResult = (newClassName: string) => {
    if (newClassName.length) {
      resultString = resultString.concat(
        resultString.length
          ? ' '
          : '',
        newClassName.trim(),
      );
    }

    return resultString;
  };

  const parsePrimitives = (primitive: string | number) => {
    if (typeof primitive === 'string') {
      if (primitive === 'undefined') {
        return resultString;
      }

      return addClassToResult(primitive);
    }

    if (primitive !== 0) {
      return addClassToResult(primitive.toString());
    }

    return resultString;
  };

  args.forEach((nestedArg) => {
    if (typeof nestedArg === 'number' || typeof nestedArg === 'string') {
      return parsePrimitives(nestedArg);
    }

    if (typeof nestedArg === 'object' && !Array.isArray(nestedArg)) {
      Object.keys(nestedArg || {})
        .forEach((classKey) => {
          if (nestedArg?.[classKey]) {
            parsePrimitives(classKey);
          }
        });

      return resultString;
    }

    if (Array.isArray(nestedArg)) {
      return addClassToResult(classNames(...nestedArg));
    }

    return resultString;
  });

  return resultString;
};
