declare module '*.scss' {
    interface IClassNames {
        [className: string]: string;
    }
    const classNames: IClassNames;
    export = classNames;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.webp';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.pdf';
declare module '*.ttf';
// declare module '*.svg' {
//     import React from 'react';

//     const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
//     export default SVG;
// }

declare module '*.svg' {
    import React from 'react';

    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

declare module '*.svg?url' {
    const src: string;
    export default src;
}

// React 19 JSX namespace support
declare global {
    namespace JSX {
        type Element = React.JSX.Element;
        type ElementClass = React.JSX.ElementClass;
        type IntrinsicElements = React.JSX.IntrinsicElements;
    }
}

declare const __IS_DEV__: boolean;
declare const __API__: string;
declare const __API_CHATS__: string;
declare const __API_AI_WIKI__: string;
declare const __SUPABASE_URL__: string;
declare const __SUPABASE_ANON_KEY__: string;
declare const __MYMEMORY_EMAIL__: string;
declare const __PROJECT__: 'frontend';
declare const __APP_VERSION__: string;
declare const __SENTRY_DSN__: string;

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

type OptionalRecord<K extends keyof any, T> = {
    [P in K]?: T;
};

// type TupleEntry<T extends readonly unknown[], I extends unknown[] = [], R = never> =
//   T extends readonly [infer Head, ...infer Tail] ?
//     TupleEntry<Tail, [...I, unknown], R | [`${I['length']}`, Head]> :
//     R

// type ObjectEntry<T extends {}> =
//   T extends object ?
//     { [K in keyof T]: [K, Required<T>[K]] }[keyof T] extends infer E ?
//       E extends [infer K, infer V] ?
//         K extends string | number ?
//           [`${K}`, V] :
//           never :
//         never :
//       never :
//     never

// type Entry<T extends {}> =
//   T extends readonly [unknown, ...unknown[]] ?
//     TupleEntry<T> :
//     T extends ReadonlyArray<infer U> ?
//       [`${number}`, U] :
//       ObjectEntry<T>

// interface ObjectConstructor {
//     entries<T extends {}>(object: T): Array<Entry<T>>
// }

declare namespace Intl {
    type Key = 'calendar' | 'collation' | 'currency' | 'numberingSystem' | 'timeZone' | 'unit';

    function supportedValuesOf(input: Key): string[];
}
