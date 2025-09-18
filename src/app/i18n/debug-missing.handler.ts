import { Injectable } from '@angular/core';
import {
  TranslocoMissingHandler,
  TranslocoMissingHandlerData,
  HashMap,
} from '@jsverse/transloco';

export class DebugMissingHandler implements TranslocoMissingHandler {
  handle(key: string, data: TranslocoMissingHandlerData) {
    console.warn('[i18n missing]', key, data.scopes);
    return key;
  }
}