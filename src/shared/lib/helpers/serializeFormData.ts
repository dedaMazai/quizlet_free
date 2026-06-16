export const serializeFormData = (data: unknown): string => {
    if (data === null || data === undefined) return 'null';
    if (typeof data !== 'object') return JSON.stringify(data);

    if (Array.isArray(data)) {
        return JSON.stringify(data.map(item => serializeFormData(item)));
    }

    // Сортируем ключи для стабильного порядка
    const record = data as Record<string, unknown>;
    const sortedKeys = Object.keys(record).sort();
    const sortedObj: Record<string, unknown> = {};
    sortedKeys.forEach(key => {
        sortedObj[key] = record[key];
    });

    return JSON.stringify(sortedObj);
};
