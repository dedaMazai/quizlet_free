import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';

/**
 * Build CSS/SCSS loader for project files (with CSS modules support)
 */
export function buildCssLoader(isDev: boolean): webpack.RuleSetRule {
    return {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
                loader: 'css-loader',
                options: {
                    modules: {
                        auto: (resPath: string) => Boolean(resPath.includes('.module.')),
                        localIdentName: isDev
                            ? '[path][name]__[local]--[hash:base64:5]'
                            : '[hash:base64:8]',
                        namedExport: false,
                        exportLocalsConvention: 'as-is',
                    },
                },
            },
            'sass-loader',
        ],
    };
}

/**
 * Build CSS loader for node_modules (plain CSS without modules)
 * Used for libraries like ProseMirror, KaTeX, etc.
 */
export function buildNodeModulesCssLoader(isDev: boolean): webpack.RuleSetRule {
    return {
        test: /\.css$/i,
        include: /node_modules/,
        use: [
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
        ],
    };
}
