import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { BuildOptions } from './types/config';

export function buildDevServer(options: BuildOptions): DevServerConfiguration {
    return {
        port: options.port,
        open: true,
        historyApiFallback: true,
        hot: true,
        allowedHosts: 'all',
        compress: false,
        client: {
            overlay: {
                errors: true,
                warnings: false,
                runtimeErrors: true,
            },
            progress: true,
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        static: {
            publicPath: '/',
        },
        proxy: [
            {
                context: ['/api'],
                target: options.targetUrl,
                secure: false,
                changeOrigin: true,
                ws: true,
                onProxyReq: (proxyReq, req) => {
                    proxyReq.setHeader('Accept-Encoding', 'identity');
                    console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.protocol}//${proxyReq.getHeader('host')}${proxyReq.path}`);
                },
                onProxyRes: (proxyRes, req) => {
                    if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
                        proxyRes.headers['cache-control'] = 'no-cache';
                        proxyRes.headers['connection'] = 'keep-alive';
                        proxyRes.headers['x-accel-buffering'] = 'no';
                        delete proxyRes.headers['content-encoding'];
                        console.log(`[Proxy SSE] ${req.method} ${req.url} — streaming`);
                    }
                },
            },
        ],
    };
}
