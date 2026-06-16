/**
 * Определяет контрастный цвет текста (черный или белый) на основе яркости фонового цвета
 * @param backgroundColor - цвет фона в формате HEX (#RRGGBB или #RGB)
 * @returns 'black' или 'white' в зависимости от яркости фона
 */
export const getContrastTextColor = (backgroundColor: string): 'black' | 'white' => {
    // Убираем символ #
    const hex = backgroundColor.replace('#', '');
    
    // Преобразуем короткий формат (#RGB) в полный (#RRGGBB)
    const fullHex = hex.length === 3
        ? hex.split('').map(char => char + char).join('')
        : hex;
    
    // Извлекаем RGB компоненты
    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);
    
    // Вычисляем яркость по формуле относительной яркости (ITU-R BT.709)
    // https://www.w3.org/TR/WCAG20/#relativeluminancedef
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    
    // Порог яркости: если фон светлый (> 175), используем черный текст
    // Если фон темный (<= 175), используем белый текст
    return brightness > 175 ? 'black' : 'white';
};

