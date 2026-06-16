export function getStringQueryParams(params: OptionalRecord<string, string>) {
    const searchParams = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([name, value]) => {
        if (value !== undefined) {
            searchParams.set(name, value);
        } else if (searchParams.has(name)) {
            searchParams.delete(name);
        }
    });

    return `?${searchParams.toString()}`;
}

export function getQueryParams<Type extends OptionalRecord<string, string>>(
    updater?: () => void,
) {
    updater?.(); // чтобы доставать новые значения из строки

    const params: OptionalRecord<string, string> = {};
    const searchParams = new URLSearchParams(window.location.search);

    Array.from(searchParams.entries()).forEach(([key, value]) => {
        params[key] = value;
    });

    return params as Type;
}

// Функция добавления параметров строки запроса в URL

export function addQueryParams(params: OptionalRecord<string, string>) {
    const newSearchParamsString = getStringQueryParams(params);


    if (newSearchParamsString !== window.location.search) {
        window.history.pushState(null, '', getStringQueryParams(params));
    }
}
