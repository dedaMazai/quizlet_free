import { BuildOptions } from '../types/config';

interface BuildBabelLoaderProps extends BuildOptions {
    isTsx?: boolean;
}

export function buildBabelLoader({ isDev, isTsx }: BuildBabelLoaderProps) {
    return {
        test: isTsx ? /\.(jsx|tsx)$/ : /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                cacheDirectory: true,
                cacheCompression: false,
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                browsers: ['>0.25%', 'not dead', 'not op_mini all'],
                            },
                            modules: false,
                            useBuiltIns: 'usage',
                            corejs: 3,
                        },
                    ],
                    [
                        '@babel/preset-react',
                        {
                            runtime: 'automatic',
                        },
                    ],
                    [
                        '@babel/preset-typescript',
                        {
                            isTSX: isTsx,
                            allExtensions: isTsx,
                        },
                    ],
                ],
                plugins: [
                    '@babel/plugin-transform-runtime',
                    isDev && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
            },
        },
    };
}
