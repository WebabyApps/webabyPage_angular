import { AngularNodeAppEngine, createNodeRequestHandler, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Pliki statyczne serwuje Nginx, ale zostawiamy fallback
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
  }),
);

// Wszystkie pozostałe requesty → SSR
app.use('/**', createNodeRequestHandler(async (req, res, next) => {
  try {
    const response = await angularApp.handle(req, res);
    if (response) {
      await writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}));

const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
