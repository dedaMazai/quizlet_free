import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { BuildOptions } from './types/config';

export function buildPlugins({
    paths, isDev, apiUrl, apiChatsUrl, apiAiWikiUrl, supabaseUrl, supabaseAnonKey, myMemoryEmail, project, appVersion,
}: BuildOptions): webpack.WebpackPluginInstance[] {
    const isProd = !isDev;

    const plugins: webpack.WebpackPluginInstance[] = [
        new HtmlWebpackPlugin({
            template: paths.html,
            favicon: paths.icon,
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
                filename: 'css/[name].[contenthash:8].css',
                chunkFilename: 'css/[name].[contenthash:8].css',
            }),
        );
        plugins.push(
            new CopyPlugin({
                patterns: [{ from: paths.locales, to: paths.buildLocales }],
            }),
        );
        // Gzip compression
        plugins.push(
            new CompressionPlugin({
                algorithm: 'gzip',
                test: /\.(js|css|html|svg)$/,
                threshold: 10240, // Only compress files > 10KB
                minRatio: 0.8,
            }),
        );
        // Brotli compression (better compression ratio)
        plugins.push(
            new CompressionPlugin({
                algorithm: 'brotliCompress',
                test: /\.(js|css|html|svg)$/,
                threshold: 10240,
                minRatio: 0.8,
                filename: '[path][base].br',
            }),
        );
    }

    return plugins;
}
