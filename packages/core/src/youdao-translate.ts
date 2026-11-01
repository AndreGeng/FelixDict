// Web translation protocol adapted from Raycast-Easydict, MIT.
// Copyright (c) 2022–present tisfeng, maxchang3. See THIRD_PARTY.md.
import { createHash, createDecipheriv, randomInt } from 'node:crypto';
import { request } from './request.js';
import { direction, resolvedTarget } from './languages.js';
import type { LanguagePreferences } from './types.js';

const digest = (value: string) => createHash('md5').update(value).digest();
const webLanguage = (value: string) => value === 'zh-Hans' ? 'zh-CHS' : value;
// The web endpoint needs an anonymous numeric@host client cookie for uncached text.
// Generate it locally; never read browser cookies or the user's actual IP address.
const headers = { Origin: 'https://fanyi.youdao.com', Referer: 'https://fanyi.youdao.com/',
  Cookie: `OUTFOX_SEARCH_USER_ID=${randomInt(1, 2147483647)}@127.0.0.1;` };

export class YoudaoTranslationError extends Error {
  constructor(code: 40 | 50 = 50) {
    super(code === 40 ? '有道未能处理此语种对，请使用 Google 或 Bing'
      : '有道翻译请求未成功，请稍后重试或使用 Google / Bing');
  }
}

function signedFields(secret: string, keyid: string) {
  const mysticTime = String(Date.now());
  return { client: 'fanyideskweb', product: 'webfanyi', appVersion: '1.0.0', vendor: 'web',
    pointParam: 'client,mysticTime,product', keyfrom: 'fanyi.web', mysticTime, keyid,
    sign: digest(`client=fanyideskweb&mysticTime=${mysticTime}&product=webfanyi&key=${secret}`).toString('hex') };
}

export function decodeYoudaoTranslation(data: unknown) {
  if (!data || typeof data !== 'object') throw new Error('Invalid Youdao translation');
  const value = data as Record<string, unknown>;
  if (value.code === 40 || value.code === 50) throw new YoudaoTranslationError(value.code);
  if (value.code !== 0 || !Array.isArray(value.translateResult) || typeof value.type !== 'string') {
    throw new Error('Invalid Youdao translation');
  }
  const pair = value.type.split('2');
  if (pair.length !== 2 || pair.some(lang => !/^[a-zA-Z-]+$/.test(lang))) throw new Error('Invalid Youdao language pair');
  const paragraphs = value.translateResult.map((paragraph: unknown) => {
    if (!Array.isArray(paragraph) || !paragraph.length) throw new Error('Invalid Youdao paragraph');
    return paragraph.map((cell: unknown) => {
      if (!cell || typeof cell !== 'object' || !('tgt' in cell) || typeof cell.tgt !== 'string') {
        throw new Error('Invalid Youdao segment');
      }
      return cell.tgt;
    }).join('');
  });
  const translation = paragraphs.join('\n');
  if (!translation.trim()) throw new Error('Empty Youdao translation');
  return { translation, from: pair[0], to: pair[1] };
}

// Inject transport for deterministic tests; production uses the shared curl implementation.
export function createYoudaoTranslator(send: typeof request) {
  return async (query: string, signal?: AbortSignal, preferences?: LanguagePreferences) => {
    const input = direction(query, preferences);
    const keyResponse = await send('https://dict.youdao.com/webtranslate/key?' + new URLSearchParams(
      signedFields('asdjnjfenknafdfsdfsd', 'webfanyi-key-getter')), { signal, headers });
    const keys = JSON.parse(keyResponse.body);
    if (keys?.code !== 0 || !keys.data ||
        !['secretKey', 'aesKey', 'aesIv'].every(key => typeof keys.data[key] === 'string' && keys.data[key].trim())) {
      throw new Error('Invalid Youdao key response');
    }
    const translate = async (from: string, to: string) => {
      const response = await send('https://dict.youdao.com/webtranslate', { signal, headers,
        body: new URLSearchParams({ ...signedFields(keys.data.secretKey, 'webfanyi'), i: input.text, from, to }).toString() });
      const decipher = createDecipheriv('aes-128-cbc', digest(keys.data.aesKey), digest(keys.data.aesIv));
      const plain = Buffer.concat([decipher.update(Buffer.from(response.body, 'base64url')), decipher.final()]);
      return decodeYoudaoTranslation(JSON.parse(plain.toString('utf8')));
    };
    // The web API rejects auto -> explicit-target for some languages. Detect with auto -> auto first.
    const detected = await translate('auto', 'auto');
    const target = webLanguage(resolvedTarget(query, detected.from, preferences));
    if (detected.to === target) return detected.translation;
    const result = await translate(detected.from, target);
    if (result.to !== target) throw new Error('Unexpected Youdao target language');
    return result.translation;
  };
}

export const youdaoTranslate = createYoudaoTranslator(request);
