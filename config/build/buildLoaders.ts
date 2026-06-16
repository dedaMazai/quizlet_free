import webpack from 'webpack';
import { buildCssLoader, buildNodeModulesCssLoader } from './loaders/buildCssLoader';
import { BuildOptions } from './types/config';
import { buildBabelLoader } from './loaders/buildBabelLoader';

export function buildLoaders(options: BuildOptions): webpack.RuleSetRule[] {
  const { isDev } = options;

  // SVG as React component (import { ReactComponent as Icon } from './icon.svg')
  const svgComponentLoader: webpack.RuleSetRule = {
    test: /\.svg$/i,
    issuer: /\.[jt]sx?$/,
    resourceQuery: { not: [/url/] },
    use: [
      {
        loader: '@svgr/webpack',
        options: {
          icon: true,
          typescript: true,
          exportType: 'named',
          namedExport: 'ReactComponent',
          svgoConfig: {
            plugins: [
              {
                name: 'convertColors',
                params: {
                  currentColor: true,
                }
              }
            ]
          },
        },
      },
    ],
  };

  // SVG as URL (import iconUrl from './icon.svg?url')
  const svgUrlLoader: webpack.RuleSetRule = {
    test: /\.svg$/i,
    type: 'asset/resource',
    resourceQuery: /url/,
    generator: {
      filename: 'static/media/[name].[contenthash:8][ext]',
    },
  };

  const codeBabelLoader = buildBabelLoader({ ...options, isTsx: false });
  const tsxCodeBabelLoader = buildBabelLoader({ ...options, isTsx: true });

  const cssLoader = buildCssLoader(isDev);
  const nodeModulesCssLoader = buildNodeModulesCssLoader(isDev);

  // Asset modules for images
  const imageLoader: webpack.RuleSetRule = {
    test: /\.(png|webp|jpe?g|gif|avif)$/i,
    type: 'asset',
    parser: {
      dataUrlCondition: {
        maxSize: 8 * 1024, // 8kb - inline as base64 if smaller
      },
    },
    generator: {
      filename: 'static/images/[name].[contenthash:8][ext]',
    },
  };

  // Asset modules for fonts
  const fontLoader: webpack.RuleSetRule = {
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'static/fonts/[name].[contenthash:8][ext]',
    },
  };

  return [
    imageLoader,
    fontLoader,
    svgComponentLoader,
    svgUrlLoader,
    codeBabelLoader,
    tsxCodeBabelLoader,
    cssLoader,
    nodeModulesCssLoader,
  ];
}
