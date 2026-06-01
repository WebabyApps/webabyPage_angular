import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));

  // Można nadpisać zmienną środowiskową BROWSER_DIST gdy browser i server
  // są w różnych katalogach (np. Nginx serwuje z /var/www, Node z /opt)
  const browserDistFolder = process.env['BROWSER_DIST']
    ?? resolve(serverDistFolder, '../browser');

  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine({
    allowedHosts: ['webaby.io', 'www.webaby.io', 'localhost', '51.68.172.64'],
  });

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Statyki – fallback gdyby Nginx nie obsłużył
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
  }));

  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => {
        console.error('SSR render error:', err);
        next(err);
      });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
    console.log(`Browser dist: ${process.env['BROWSER_DIST'] ?? 'auto'}`);
  });
}

run();
