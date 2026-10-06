import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { BuildOptions } from './types/config';
import { buildPlugins } from './buildPlugins';
import { buildLoaders } from './buildLoaders';
import { buildResolvers } from './buildResolvers';
import { buildDevServer } from './buildDevServer';

export function buildWebpackConfig(options: BuildOptions): webpack.Configuration {
  const { paths, mode, isDev } = options;

  return {
    mode,
    entry: {
      main: paths.entry,
    },
    output: {
      // Всё хешированное — в static/: там immutable-кеш (vercel.json)
      filename: 'static/js/[name].[contenthash:8].js',
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
      assetModuleFilename: 'static/assets/[name].[contenthash:8][ext]',
      path: paths.build,
      clean: true,
      publicPath: '/',
      crossOriginLoading: 'anonymous',
    },
    plugins: buildPlugins(options),
    module: {
      rules: buildLoaders(options),
    },
    optimization: isDev
      ? {
          removeAvailableModules: false,
          removeEmptyChunks: false,
          // splitChunks: false,
        }
      : {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              parallel: true,
              terserOptions: {
                compress: {
                  drop_console: true,
                  drop_debugger: true,
                  pure_funcs: ['console.log', 'console.info'],
                },
                mangle: true,
                output: {
                  comments: false,
                },
              },
              extractComments: false,
            }),
            new CssMinimizerPlugin({
              minimizerOptions: {
                preset: [
                  'default',
                  {
                    discardComments: { removeAll: true },
                  },
                ],
              },
            }),
          ],
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 25,
            maxAsyncRequests: 25,
            minSize: 20000,
            cacheGroups: {
              // Только то, что нужно на старте. Библиотеки ленивых страниц и import()
              // (exceljs, zxcvbn, chart.js, motion…) остаются в своих async-чанках
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'initial',
                priority: 10,
              },
              antd: {
                test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
                name: 'antd',
                chunks: 'all',
                priority: 20,
              },
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
                priority: 20,
              },
              redux: {
                test: /[\\/]node_modules[\\/](@reduxjs|react-redux)[\\/]/,
                name: 'redux',
                chunks: 'all',
                priority: 20,
              },
              common: {
                minChunks: 2,
                priority: -10,
                reuseExistingChunk: true,
              },
            },
          },
          runtimeChunk: 'single',
        },
    resolve: buildResolvers(options),
    // Карты в проде никуда не загружаются, а публично раскрывают исходники
    devtool: isDev ? 'eval-cheap-module-source-map' : false,
    devServer: isDev ? buildDevServer(options) : undefined,
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
    performance: {
      hints: isDev ? false : 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
}
