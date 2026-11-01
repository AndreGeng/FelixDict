import { parseQuery } from './languages.js';
import type { QueryState, ResultItem } from './types.js';

function row(query: string, value: string, source: string, note = ''): ResultItem {
  return { title: value.replace(/\s+/g, ' '),
    subtitle: `${source}${note ? ` · ${note}` : ''}`,
    copy: value, speak: parseQuery(query).text, fullText: value };
}

/** Shared presentation order and action data, independent of launcher APIs. */
export function resultItems(query: string, state: QueryState): ResultItem[] {
  const items: ResultItem[] = [];
  const labels: Record<string, string> = { Youdao: '有道词典', GoogleDictionary: 'Google 词典', BingDictionary: 'Bing 词典', YoudaoTranslate: '有道翻译' };
  for (const name of ['Youdao', 'GoogleDictionary', 'BingDictionary'] as const) {
    const dict = state.results[name];
    if (!dict) continue;
    const source = labels[name];
    for (const sense of dict.senses || []) items.push({
      ...row(query, sense.text, source, [sense.note, dict.phonetic].filter(Boolean).join(' · ')),
      phonetic: dict.phonetic,
      fullText: [source, dict.phonetic, sense.note, sense.text].filter(Boolean).join('\n')
    });
    if (dict.phonetic && !dict.senses?.length) items.push({ ...row(query, dict.phonetic, source, '读音'), phonetic: dict.phonetic });
    if (dict.forms?.length) items.push(row(query, dict.forms.join('；'), `${source} · 词形变化`));
    for (const entry of dict.web || []) items.push(row(query, entry.text, `${source} · 网络释义`, entry.note));
  }
  for (const name of ['YoudaoTranslate', 'Google', 'Bing'] as const) {
    const value = state.results[name];
    if (value) items.push({ ...row(query, value, name === 'YoudaoTranslate' ? '有道翻译' : `${name} 翻译`), speak: value });
  }
  const suggestions = (state.results.Suggest || []).map(({ word, explanation }) => ({
    ...row(word, word, '有道联想', explanation), completion: word, fullText: `${word}\n${explanation}`
  }));
  items.splice(Math.min(items.length, 1), 0, ...suggestions);
  for (const [name, message] of Object.entries(state.errors)) {
    if (name !== 'Suggest') items.push({ title: `${labels[name] || name} · ${message}`, subtitle: '其他来源的结果仍可使用' });
  }
  if (state.pending.length) items.push({ title: `正在查询 ${state.pending.map(name => name === 'Suggest' ? '单词联想' : labels[name] || name).join(' / ')}…`, subtitle: query });
  if (!items.length) items.push({ title: '没有找到释义', subtitle: '尝试完整单词或短语；多语言翻译需启用 Youdao、Google 或 Bing' });
  return items;
}
