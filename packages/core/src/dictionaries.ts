import type { Dictionary, LanguagePreferences } from './types.js';
import { direction, resolvedTarget } from './languages.js';
import { request } from './request.js';

const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

// Observed Google website response: dt=bd (bilingual), rm (reading), md (definitions).
// Website protocol, not the documented Google Cloud Translation API.
export function decodeGoogleDictionary(data: unknown): Dictionary {
  if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('Invalid Google dictionary response');
  const phonetic = array(data[0]).map(segment => text(array(segment)[3])).find(Boolean);
  const original = text(array(array(data[0])[0])[1]).toLowerCase();
  const bases = new Set<string>();
  const senses: NonNullable<Dictionary['senses']> = [];
  for (const group of array(data[1])) {
    const [pos, translations] = array(group);
    const base = text(array(group)[3]);
    if (base && original && base.toLowerCase() !== original) bases.add(base);
    const words = array(translations).map(text).filter(Boolean);
    if (text(pos) && words.length) senses.push({ text: words.join('；'), note: text(pos) });
  }
  for (const group of array(data[12])) {
    const [pos, definitions] = array(group);
    const base = text(array(group)[2]);
    if (base && original && base.toLowerCase() !== original) bases.add(base);
    for (const definition of array(definitions)) {
      const value = text(array(definition)[0]);
      if (value && text(pos)) senses.push({ text: value, note: `${text(pos)} · 原文释义` });
    }
  }
  // base_form identifies the dictionary headword, not a full inflection table.
  return { phonetic, senses, forms: [...bases].map(base => `词典原形：${base}`) };
}

export async function googleDictionary(query: string, signal?: AbortSignal, preferences?: LanguagePreferences) {
  const input = direction(query, preferences);
  const lookup = async (target: string) => {
    const params = new URLSearchParams({ client: 'gtx', sl: 'auto',
      tl: target === 'zh-Hans' ? 'zh-CN' : target, q: input.text });
    for (const field of ['t', 'bd', 'rm', 'md']) params.append('dt', field);
    const response = await request(`https://translate.googleapis.com/translate_a/single?${params}`, { signal });
    const data: unknown = JSON.parse(response.body);
    return { dictionary: decodeGoogleDictionary(data), detected: text(array(data)[2]) };
  };
  const first = await lookup(input.to);
  const target = first.detected ? resolvedTarget(query, first.detected, preferences) : input.to;
  return target === input.to ? first.dictionary : (await lookup(target)).dictionary;
}

function plainText(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<[^>]*>/g, '').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, name: string) => {
      const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
      if (!name.startsWith('#')) return named[name.toLowerCase()] ?? entity;
      const value = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
      return value > 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff) ? String.fromCodePoint(value) : '';
    }).replace(/\s+/g, ' ').trim();
}

// Extract bounded elements from Bing's summary card. Match nested tags of the same
// type so nested <span>/<div> content cannot truncate definitions or leak page text.
function elements(html: string, className: string): string[] {
  const result: string[] = [];
  const opening = /<([a-z][\w-]*)\b([^>]*)>/gi;
  for (let match; (match = opening.exec(html));) {
    const classes = match[2].match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (!(classes?.[1] ?? classes?.[2] ?? '').split(/\s+/).includes(className)) continue;
    const tags = new RegExp(`<(/?)${match[1]}\\b[^>]*>`, 'gi');
    tags.lastIndex = opening.lastIndex;
    let depth = 1;
    for (let tag; (tag = tags.exec(html));) {
      depth += tag[1] ? -1 : 1;
      if (!depth) {
        result.push(html.slice(opening.lastIndex, tag.index));
        opening.lastIndex = tags.lastIndex;
        break;
      }
    }
  }
  return result;
}

// Source markup: https://cn.bing.com/dict/search?q=run&cc=cn&setlang=zh-hans
export function decodeBingDictionary(html: string): Dictionary {
  const card = elements(html, 'qdef')[0];
  if (card === undefined) {
    // A normal no-entry page has the dictionary search input. Captchas/changed
    // pages are errors, rather than successful empty dictionary entries.
    if (/\bid=["']sb_form_q["']/.test(html) && !/captcha|verify you are human/i.test(html)) return { senses: [] };
    throw new Error('Invalid Bing dictionary page');
  }
  const phonetic = ['hd_prUS', 'hd_pr'].flatMap(name => elements(card, name).map(plainText)).filter(Boolean).join(' · ');
  const summary = card.slice(0, card.indexOf('</ul>') + 5);
  const positions = elements(summary, 'pos').map(plainText);
  const definitions = elements(summary, 'def').map(plainText);
  const senses: NonNullable<Dictionary['senses']> = [];
  const web: NonNullable<Dictionary['web']> = [];
  definitions.forEach((value, index) => {
    if (!value) return;
    const note = positions[index];
    if (/^(网络|Web)$/i.test(note)) web.push({ text: value });
    else senses.push({ text: value, note });
  });
  const forms = elements(card, 'hd_if').flatMap(section => {
    const values = plainText(section);
    return values.split(/\s+(?=[^\s：:]+[：:])/).filter(Boolean);
  });
  return { phonetic, senses, forms, web };
}

export async function bingDictionary(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ q: direction(query).text, cc: 'cn', setlang: 'zh-hans' });
  const response = await request(`https://cn.bing.com/dict/search?${params}`, { signal });
  return decodeBingDictionary(response.body);
}
