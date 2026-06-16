type camelCaseIntoTokenProps = {
  value: string
  token: string
};

export function camelCaseIntoToken({
  value,
  token,
}: camelCaseIntoTokenProps) {
  return value.replace(/[A-Z]/g, (letter) => `${token}${letter.toLowerCase()}`);
}
