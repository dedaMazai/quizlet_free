import path from 'path';
import webpack from 'webpack';
import dotenv from 'dotenv';
import { buildWebpackConfig } from './config/build/buildWebpackConfig';
import { BuildMode, BuildPaths } from './config/build/types/config';

const Mode = process.env.NODE_ENV;
const pathEnv = path.resolve(__dirname, 'env', `${Mode}`, '.env');

dotenv.config({ path: pathEnv });

const getPort = (currentPort: string | undefined): number => {
    const defaultPort = 3000;
    const parsedPort = Number(currentPort);
    const portIsNan = Number.isNaN(parsedPort);

    return portIsNan
        ? defaultPort
        : parsedPort;
};

export default () => {
    const mode = Mode ? (Mode as BuildMode) : 'development';
    const PORT = getPort(process.env.PORT);
    const apiUrl = process.env.API || '/api';
    const apiChatsUrl = process.env.API_CHATS || '/api/ai-chat';
    const apiAiWikiUrl = process.env.API_AI_WIKI || '/api/ai-wiki';
    const appVersion = process.env.APP_VERSION || 'dev';
    const targetUrl = process.env.TARGET_URL || 'https://localhost:8080';
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

    const isDev = mode === 'development';

    const paths: BuildPaths = {
        entry: path.resolve(__dirname, 'src', 'index.tsx'),
        build: path.resolve(__dirname, 'build'),
        html: path.resolve(__dirname, 'public', isDev ? 'indexDev.html' : 'index.html'),
        icon: path.resolve(__dirname, 'public', 'Logo.svg'),
        src: path.resolve(__dirname, 'src'),
        locales: path.resolve(__dirname, 'public', 'locales'),
        buildLocales: path.resolve(__dirname, 'build', 'locales'),
    };

    const config: webpack.Configuration = buildWebpackConfig({
        mode,
        paths,
        isDev,
        port: PORT,
        apiUrl,
        apiChatsUrl,
        apiAiWikiUrl,
        targetUrl,
        supabaseUrl,
        supabaseAnonKey,
        project: 'frontend',
        appVersion,
    });

    return config;
};
