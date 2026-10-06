export type BuildMode = 'production' | 'development';

export interface BuildPaths {
    entry: string;
    build: string;
    html: string;
    src: string;
    public: string;
}

export interface BuildOptions {
    mode: BuildMode;
    paths: BuildPaths;
    isDev: boolean;
    port: number;
    apiUrl: string;
    apiChatsUrl: string;
    apiAiWikiUrl: string;
    targetUrl: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
    myMemoryEmail: string;
    project: 'frontend';
    appVersion: string;
}
