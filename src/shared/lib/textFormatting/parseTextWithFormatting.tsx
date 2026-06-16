
import { NavLink } from 'react-router-dom';
import { RoutePath } from '../../config/router/routePath';
import { RouteNames } from '../../config/router/routerNames';

const BULLET_SYMBOL = '•';

export const parseTextWithFormatting = (text: string): React.ReactNode => {
    // Разбиваем текст по переносам строк
    const lines = text.split('\n');

    // Рекурсивная функция для обработки вложенного форматирования
    const processText = (textContent: string, lineIndex: number, depth: number = 0): React.ReactNode => {
        const parts: React.ReactNode[] = [];
        let currentIndex = 0;

        // Объединенное регулярное выражение для поиска ссылок, внутренних ссылок, жирного текста и списков
        const combinedRegex =
            /(\[([^\]]+)\]\(([^)]+)\))|(\[\[([^\]]+):([A-Z_]+)(?::([^\]]*))?\]\])|(\*\*([^*]+)\*\*)|(^•\s+(.+))/gm;
        let match;

         
        while ((match = combinedRegex.exec(textContent)) !== null) {
            const [fullMatch, , linkText, url, , internalLinkText, routeName, routeParam, , boldText, , listItem] = match;
            const matchIndex = match.index;

            // Добавляем текст до найденного элемента
            if (matchIndex > currentIndex) {
                parts.push(textContent.slice(currentIndex, matchIndex));
            }

            if (linkText && url) {
                // Это внешняя ссылка - рекурсивно обрабатываем текст ссылки
                parts.push(
                    <a
                        key={`link-${lineIndex}-${matchIndex}-${depth}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: '#1890ff',
                            textDecoration: 'underline',
                        }}
                    >
                        {processText(linkText, lineIndex, depth + 1)}
                    </a>
                );
            } else if (internalLinkText && routeName) {
                // Это внутренняя ссылка - рекурсивно обрабатываем текст ссылки
                try {
                    const routeKey = routeName as keyof typeof RouteNames;
                    const routeNameValue = RouteNames[routeKey];

                    // Проверяем, что роут существует в обоих объектах
                    if (routeNameValue && routeNameValue in RoutePath) {
                        const routeFunction = RoutePath[routeNameValue as keyof typeof RoutePath];
                        let href: string;

                        if (typeof routeFunction === 'function') {
                            try {
                                // Пытаемся вызвать с параметром, если он есть, иначе с пустой строкой
                                href = (routeFunction as (param?: string) => string)(routeParam);
                            } catch {
                                // Если функция не принимает параметры или что-то пошло не так
                                try {
                                    href = (routeFunction as () => string)();
                                } catch {
                                    href = '/';
                                }
                            }
                        } else {
                            href = routeFunction;
                        }

                        parts.push(
                            <NavLink
                                key={`internal-link-${lineIndex}-${matchIndex}-${depth}`}
                                to={href}
                                style={{
                                    color: '#1890ff',
                                    textDecoration: 'underline',
                                }}
                            >
                                {processText(internalLinkText, lineIndex, depth + 1)}
                            </NavLink>
                        );
                    } else {
                        // Если роут не найден, отображаем как обычный текст
                        parts.push(
                            <span
                                key={`invalid-route-${lineIndex}-${matchIndex}-${depth}`}
                                style={{
                                    color: '#1890ff',
                                    textDecoration: 'underline',
                                }}
                            >
                                {processText(internalLinkText, lineIndex, depth + 1)}
                            </span>
                        );
                    }
                } catch (error) {
                    // В случае ошибки отображаем как обычный текст
                    parts.push(internalLinkText);
                }
            } else if (boldText) {
                // Это жирный текст - рекурсивно обрабатываем содержимое
                parts.push(
                    <strong key={`bold-${lineIndex}-${matchIndex}-${depth}`}>
                        {processText(boldText, lineIndex, depth + 1)}
                    </strong>
                );
            } else if (listItem) {
                // Это элемент списка - рекурсивно обрабатываем содержимое
                parts.push(
                    <span
                        key={`list-${lineIndex}-${matchIndex}-${depth}`}
                        style={{
                            marginLeft: '20px',
                            position: 'relative',
                        }}
                    >
                        <span
                            style={{
                                position: 'absolute',
                                left: '-15px',
                                fontWeight: 'bold',
                            }}
                        >
                            {BULLET_SYMBOL}
                        </span>
                        {processText(listItem, lineIndex, depth + 1)}
                    </span>
                );
            }

            currentIndex = matchIndex + fullMatch.length;
        }

        // Добавляем оставшийся текст после последнего элемента
        if (currentIndex < textContent.length) {
            parts.push(textContent.slice(currentIndex));
        }

        return parts.length > 0 ? parts : textContent;
    };

    // Обрабатываем каждую строку и добавляем переносы
    const processedLines: React.ReactNode[] = [];
    lines.forEach((line, index) => {
        if (index > 0) {
            // Добавляем перенос строки между строками
            processedLines.push(<br key={`br-${index}`} />);
        }
        const processedLine = processText(line, index);

        processedLines.push(
            <span key={`line-${index}`}>
                {processedLine}
            </span>
        );
    });

    return processedLines;
};