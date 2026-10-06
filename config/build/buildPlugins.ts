import fs from 'fs';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { BuildOptions } from './types/config';
import { SitemapPlugin } from './plugins/SitemapPlugin';

/**
 * Русские ключи и есть русский текст, поэтому в бандл попадают только записи,
 * где перевод отличается от ключа (плюралы, системные ошибки) — ~20 КБ вместо 360.
 * Так ru не ждёт загрузки JSON перед первым рендером.
 */
const readRuTranslations = (publicDir: string): Record<string, string> => {
    const file = path.resolve(publicDir, 'locales', 'ru', 'translation.json');
    const all: Record<string, string> = JSON.parse(fs.readFileSync(file, 'utf-8'));

    return Object.fromEntries(Object.entries(all).filter(([key, value]) => key !== value));
};

export function buildPlugins({
    paths, isDev, apiUrl, apiChatsUrl, apiAiWikiUrl, supabaseUrl, supabaseAnonKey, myMemoryEmail, project, appVersion,
}: BuildOptions): webpack.WebpackPluginInstance[] {
    const isProd = !isDev;

    const plugins: webpack.WebpackPluginInstance[] = [
        new HtmlWebpackPlugin({
            template: paths.html,
            minify: isProd
                ? {
                      removeComments: true,
                      collapseWhitespace: true,
                      removeRedundantAttributes: true,
                      useShortDoctype: true,
                      removeEmptyAttributes: true,
                      removeStyleLinkTypeAttributes: true,
                      keepClosingSlash: true,
                      minifyJS: true,
                      minifyCSS: true,
                      minifyURLs: true,
                  }
                : false,
        }),
        new webpack.DefinePlugin({
            __IS_DEV__: JSON.stringify(isDev),
            __API__: JSON.stringify(apiUrl),
            __API_CHATS__: JSON.stringify(apiChatsUrl),
            __API_AI_WIKI__: JSON.stringify(apiAiWikiUrl),
            __SUPABASE_URL__: JSON.stringify(supabaseUrl),
            __SUPABASE_ANON_KEY__: JSON.stringify(supabaseAnonKey),
            __MYMEMORY_EMAIL__: JSON.stringify(myMemoryEmail),
            __PROJECT__: JSON.stringify(project),
            __APP_VERSION__: JSON.stringify(appVersion),
            __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN ?? ''),
            __RU_TRANSLATIONS__: JSON.stringify(readRuTranslations(paths.public)),
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true,
        }),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
                mode: 'write-references',
            },
        }),
    ];

    if (isDev) {
        plugins.push(new webpack.ProgressPlugin());
        plugins.push(new ReactRefreshWebpackPlugin({ overlay: false }));
        // HotModuleReplacementPlugin is now built into webpack-dev-server 5
        // plugins.push(new webpack.HotModuleReplacementPlugin());
        // plugins.push(new BundleAnalyzerPlugin({
        //     openAnalyzer: true,
        // }));
    }

    if (isProd) {
        plugins.push(
            new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].css',
            }),
        );
        plugins.push(new SitemapPlugin());
        // Весь public/ как есть: переводы, robots.txt, иконки, og-image, manifest.
        // Сжатие не делаем — Vercel сжимает ответы сам, готовые .gz/.br он игнорирует
        plugins.push(
            new CopyPlugin({
                patterns: [{
                    from: paths.public,
                    to: paths.build,
                    globOptions: { ignore: ['**/index.html', '**/indexDev.html'] },
                }],
            }),
        );
    }

    return plugins;
}
