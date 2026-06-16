export function rgbaParser(rgb: string) {
  return rgb.replace(/[^\d.,]/g, '')
    .split(',')
    .map(Number);
}
