export function containsOnlyLatinLetters(str: string) {
  return /^([a-z\d_\s]+)$/.test(str);
}

export function hasNoSpaces(str: string) {
  return !!str && !/\s/.test(str);
}
