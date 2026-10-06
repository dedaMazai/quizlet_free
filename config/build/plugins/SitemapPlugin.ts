import webpack from 'webpack';
import { INDEXABLE_PAGES } from '../../../src/shared/config/router/indexablePages';
import { SITE_URL } from '../../../src/shared/config/router/siteUrl';

const PLUGIN_NAME = 'SitemapPlugin';

/**
 * sitemap.xml из INDEXABLE_PAGES. Он же — список страниц для пререндера (scripts/prerender.mjs).
 */
export class SitemapPlugin {
    apply(compiler: webpack.Compiler) {
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.processAssets.tap(
                { name: PLUGIN_NAME, stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
                () => {
                    const lastmod = new Date().toISOString().slice(0, 10);
                    const urls = INDEXABLE_PAGES.map((page) => (
                        `  <url><loc>${SITE_URL}${page}</loc><lastmod>${lastmod}</lastmod></url>`
                    ));
                    const xml = [
                        '<?xml version="1.0" encoding="UTF-8"?>',
                        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                        ...urls,
                        '</urlset>',
                        '',
                    ].join('\n');

                    compilation.emitAsset('sitemap.xml', new webpack.sources.RawSource(xml));
                },
            );
        });
    }
}
