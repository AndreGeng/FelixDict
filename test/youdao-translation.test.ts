import test from 'node:test';
import assert from 'node:assert/strict';
import { createCipheriv, createHash } from 'node:crypto';
import { createYoudaoTranslator, decodeYoudaoTranslation, YoudaoTranslationError } from '@felixdict/core/youdao-translate';
import { selectProviders } from '@felixdict/core/providers';
import { resultItems } from '@felixdict/core/results';
import { queryProviders } from '@felixdict/core/core';

function fixture(responses: unknown[]) {
  const calls: { url: string; body?: URLSearchParams; signal?: AbortSignal; cookie?: string }[] = [];
  const md5 = (s: string) => createHash('md5').update(s).digest();
  const send: Parameters<typeof createYoudaoTranslator>[0] = async (url, options = {}) => {
    calls.push({ url, body: options.body ? new URLSearchParams(options.body) : undefined, signal: options.signal, cookie: options.headers?.Cookie });
    if (url.includes('/key?')) return { url, body: JSON.stringify({ code: 0, data: { secretKey: 'fixture-secret', aesKey: 'fixture-key', aesIv: 'fixture-iv' } }) };
    assert.ok(responses.length, 'unexpected translation request');
    const cipher = createCipheriv('aes-128-cbc', md5('fixture-key'), md5('fixture-iv'));
    return { url, body: Buffer.concat([cipher.update(JSON.stringify(responses.shift())), cipher.final()]).toString('base64url') };
  };
  return { translate: createYoudaoTranslator(send), calls };
}
const translated = (type: string, ...paragraphs: string[]) => ({ code: 0, type,
  translateResult: paragraphs.map(tgt => [{ tgt }]) });

test('Youdao detects with auto/auto and reuses a matching translation', async () => {
  const f = fixture([translated('ja2zh-CHS', '你好', '世界')]);
  const signal = AbortSignal.timeout(1000);
  assert.equal(await f.translate('こんにちは\n世界', signal, { primary: 'zh', secondary: 'en' }), '你好\n世界');
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[1].body!.get('from'), 'auto');
  assert.equal(f.calls[1].body!.get('to'), 'auto');
  assert.ok(f.calls.every(call => call.signal === signal));
  assert.match(f.calls[0].cookie!, /^OUTFOX_SEARCH_USER_ID=\d+@127\.0\.0\.1;$/);
  assert.ok(f.calls.every(call => call.cookie === f.calls[0].cookie));
});

test('Youdao honors explicit targets and does not send query prefixes', async () => {
  const f = fixture([translated('zh-CHS2en', 'Hello'), translated('zh-CHS2ja', 'こんにちは')]);
  assert.equal(await f.translate(':ja 你好'), 'こんにちは');
  assert.equal(f.calls[2].body!.get('from'), 'zh-CHS');
  assert.equal(f.calls[2].body!.get('to'), 'ja');
  assert.equal(f.calls[2].body!.get('i'), '你好');
});

test('Youdao selects secondary language from detected source and validates actual target', async () => {
  const f = fixture([translated('ja2zh-CHS', '东京'), translated('ja2en', 'Tokyo')]);
  assert.equal(await f.translate('東京', undefined, { primary: 'ja', secondary: 'en' }), 'Tokyo');
  assert.equal(f.calls[2].body!.get('to'), 'en');
  const wrong = fixture([translated('zh-CHS2en', 'Hello'), translated('zh-CHS2en', 'Hello')]);
  await assert.rejects(wrong.translate(':ja 你好'), /Unexpected Youdao target/);
});

test('Youdao rejects malformed/empty responses and isolates rejected requests', async () => {
  for (const data of [null, {}, { code: 0, type: 'en2zh-CHS', translateResult: [[{}]] }, translated('en2zh-CHS', '')]) {
    assert.throws(() => decodeYoudaoTranslation(data));
  }
  assert.throws(() => decodeYoudaoTranslation({ code: 50 }), YoudaoTranslationError);
  assert.throws(() => decodeYoudaoTranslation({ code: 40 }), /语种对/);
  const f = fixture([{ code: 50 }]);
  const state = await queryProviders(':pt 你好', { YoudaoTranslate: f.translate, Google: async () => 'Olá' });
  assert.equal(state.results.Google, 'Olá');
  assert.match(state.errors.YoudaoTranslate, /请求未成功/);
  assert.equal(state.pending.length, 0);
});

test('Youdao enables translation for multilingual input and preserves dictionary control', () => {
  assert.deepEqual(Object.keys(selectProviders(['Youdao'], ':ja 你好')), ['YoudaoTranslate']);
  assert.deepEqual(Object.keys(selectProviders(['Youdao'], 'hello')), ['Youdao', 'YoudaoTranslate', 'Suggest']);
  assert.deepEqual(Object.keys(selectProviders(['Google'], 'hello')), ['Google']);
  const items = resultItems(':ja 你好', { updated: 0, results: { YoudaoTranslate: 'こんにちは', Google: 'やあ' }, errors: {}, pending: [] });
  assert.equal(items[0].subtitle, '有道翻译');
  assert.equal(items[0].copy, 'こんにちは');
  assert.equal(items[0].speak, 'こんにちは');
  assert.equal(items[1].subtitle, 'Google 翻译');
});
