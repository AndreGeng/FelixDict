import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeBingDictionary, decodeGoogleDictionary, selectProviders } from '@felixdict/core/providers';
import { queryProviders } from '@felixdict/core/core';
import { resultItems } from '@felixdict/core/results';
import { render } from '../apps/alfred/src/render.ts';
import { resultRows } from '@felixdict/core/session';

test('Google keeps source reading, bilingual parts of speech and original definitions separate', () => {
  const data: unknown[] = [
    [['译文', 'test'], [null, null, 'target reading', 'source reading']],
    [['noun', ['测试', '检验']], ['verb', ['测试']], [null, ['invalid']]], 'en'
  ];
  data[12] = [['noun', [['a trial of something.', 'entry-id', 'example']], 'test']];
  const result = decodeGoogleDictionary(data);
  assert.equal(result.phonetic, 'source reading');
  assert.deepEqual(result.senses, [
    { text: '测试；检验', note: 'noun' }, { text: '测试', note: 'verb' },
    { text: 'a trial of something.', note: 'noun · 原文释义' }
  ]);
  assert.deepEqual(result.forms, []);
  for (const input of [null, {}, [null]]) assert.throws(() => decodeGoogleDictionary(input));
  assert.deepEqual(decodeGoogleDictionary([[['译文', 'a sentence']], null, 'en']).senses, []);
});

test('Google extracts distinct base forms without claiming an inflection table', () => {
  const data: unknown[] = [[['孩子们', 'children']], [['noun', ['孩子们'], [], 'children']], 'en'];
  data[12] = [['noun', [['a young person.']], 'child']];
  assert.deepEqual(decodeGoogleDictionary(data).forms, ['词典原形：child']);
  data[0] = [['去了', 'went']];
  data[1] = [['verb', ['去'], [], 'go']];
  data[12] = [['verb', [['travel.']], 'go']];
  assert.deepEqual(decodeGoogleDictionary(data).forms, ['词典原形：go']);
  data[0] = [['去', 'GO']];
  assert.deepEqual(decodeGoogleDictionary(data).forms, []);
});

const bingPage = `<html><div class='other'><span class='def'>unrelated</span></div>
<div class='qdef extra'><div class='hd_area'><div class='hd_prUS b_primtxt'>美&#160;[test]</div>
<div class='hd_pr'>英&nbsp;[test]</div></div><ul>
<li><span class='pos'>n.</span><span class='def b_regtxt'><a>测</a><span>试</span>；检验 &amp; 检查</span></li>
<li><span class='pos web'>网络</span><span class='def'>网络&#x91ca;义</span></li></ul>
<div><div class='hd_if'><span>复数：</span><a>tests</a>&#160;&#160;<span>过去式：</span><a>tested</a></div></div>
</div><div class='def'>must not leak</div></html>`;

test('Bing summary parsing scopes nested markup, entities, pronunciations and inflections', () => {
  const dict = decodeBingDictionary(bingPage);
  assert.equal(dict.phonetic, '美 [test] · 英 [test]');
  assert.deepEqual(dict.senses, [{ text: '测试；检验 & 检查', note: 'n.' }]);
  assert.deepEqual(dict.forms, ['复数：tests', '过去式：tested']);
  assert.deepEqual(dict.web, [{ text: '网络释义' }]);
  assert.deepEqual(decodeBingDictionary('<input id="sb_form_q" value="unknown">').senses, []);
  assert.throws(() => decodeBingDictionary('<html>captcha</html>'));
  assert.throws(() => decodeBingDictionary('<div class="qdef">truncated'));
  const missing = decodeBingDictionary('<div class="qdef"><ul><li><span class="pos">n.</span><span class="def">释义</span></li></ul></div>');
  assert.equal(missing.phonetic, '');
  assert.deepEqual(missing.forms, []);
});

test('provider switches include dictionaries, while explicit targets and sentences remain translation only', () => {
  assert.deepEqual(Object.keys(selectProviders(['Google', 'Bing'], 'test')),
    ['Google', 'GoogleDictionary', 'Bing', 'BingDictionary']);
  for (const query of [':ja test', '今日はいい天気', 'This is a complete sentence.', '']) {
    assert.deepEqual(Object.keys(selectProviders(['Google', 'Bing'], query)), ['Google', 'Bing']);
  }
  assert.deepEqual(Object.keys(selectProviders(['Google'], 'test')), ['Google', 'GoogleDictionary']);
  assert.deepEqual(Object.keys(selectProviders(['Bing'], 'test', { primary: 'ja', secondary: 'en' })), ['Bing']);
});

test('dictionary rows retain sources, pronunciation, full detail and original-word speech across launchers', () => {
  const state = { updated: 0, pending: [], errors: {}, results: {
    GoogleDictionary: decodeGoogleDictionary([[[null, null, null, 'test']], [['noun', ['测试']]]]),
    BingDictionary: decodeBingDictionary(bingPage), Google: '测试译文'
  } };
  const rows = resultItems('test', state);
  assert.match(rows[0].subtitle, /Google 词典.*noun.*test/);
  assert.match(rows[0].fullText!, /Google 词典\ntest\nnoun\n测试/);
  assert.equal(rows[0].speak, 'test');
  assert.equal(rows[0].phonetic, 'test');
  assert.ok(rows.some(row => row.subtitle === 'Bing 词典 · 词形变化'));
  assert.equal(rows.at(-1)!.speak, '测试译文');
  assert.deepEqual(render('test', state).items.map(row => row.title), rows.map(row => row.title));
  assert.deepEqual(resultRows('test', state).map(row => row.speak), rows.map(row => row.speak));
});

test('a failed dictionary cannot discard the same service translation or another dictionary', async () => {
  const state = await queryProviders('test', {
    Google: async () => '测试译文', GoogleDictionary: async () => { throw new Error('private upstream data'); },
    BingDictionary: async () => decodeBingDictionary(bingPage)
  });
  assert.equal(state.results.Google, '测试译文');
  assert.ok(state.results.BingDictionary?.forms?.length);
  const output = resultItems('test', state);
  assert.ok(output.some(row => row.title === '测试译文'));
  assert.ok(output.some(row => row.title.startsWith('Google 词典 · 查询失败')));
  assert.doesNotMatch(JSON.stringify(output), /private upstream/);
});
