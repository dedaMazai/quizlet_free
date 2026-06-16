export const isWikiRoute = (pathname: string): boolean =>
    pathname.startsWith('/wiki')
    || pathname.startsWith('/documents')
    || pathname.startsWith('/collections');
