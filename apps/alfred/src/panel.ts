import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { cacheKey, queryProviders, readState, saveState } from '@felixdict/core/core';
import { languagePreferences, parseQuery, targets } from '@felixdict/core/languages';
import { selectProviders } from '@felixdict/core/providers';
import type { Providers, QueryState } from '@felixdict/core/types';

const sources = ['YoudaoTranslate', 'Google'];

export async function launchPanel(text: string) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const child = spawn(join(root, 'panel', 'FelixDictPanel'), [process.execPath], {
    cwd: root, detached: true, stdio: ['pipe', 'ignore', 'ignore'],
  });
  await new Promise<void>((resolve, reject) => {
    child.once('error', reject);
    child.stdin.once('error', reject);
    child.stdin.end(text, resolve);
  });
  child.unref();
}

export async function translatePanel(cacheDir: string, enabled: string[], ttl: number) {
  const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const cancellation = new AbortController();
  process.once('SIGTERM', () => { cancellation.abort(); input.close(); });
  const send = (event: object) => {
    if (!cancellation.signal.aborted) process.stdout.write(JSON.stringify(event) + '\n');
  };

  for await (const line of input) {
    // The host supplies one request over stdin and closes it.
    try {
      const request = JSON.parse(line);
      if (typeof request.text !== 'string' || typeof request.target !== 'string' ||
          (request.target && !targets.includes(request.target)) ||
          (request.retry !== undefined && !sources.includes(request.retry))) {
        throw new Error('无效的翻译请求');
      }
      const text = request.text.trim();
      if (!text || text.length > 2000) throw new Error('请输入 1–2000 字符的原文');
      const query = request.target ? `:${request.target} ${text}` : text;
      if (!parseQuery(query).text) throw new Error('请输入要翻译的内容');
      const preferences = languagePreferences();
      const available = selectProviders(enabled, query, preferences);
      const names = sources.filter(name => available[name] && (!request.retry || name === request.retry));
      if (!names.length) throw new Error('请在 Workflow 设置中启用 Youdao 或 Google 翻译');
      const selected: Providers = Object.fromEntries(names.map(name => [name, (query, timeout) => {
        const signal = new AbortController();
        const abort = () => signal.abort();
        if (timeout?.aborted || cancellation.signal.aborted) abort();
        timeout?.addEventListener('abort', abort, { once: true });
        cancellation.signal.addEventListener('abort', abort, { once: true });
        return available[name](query, signal.signal).finally(() => {
          timeout?.removeEventListener('abort', abort);
          cancellation.signal.removeEventListener('abort', abort);
        });
      }]));
      const path = join(cacheDir, `panel-${cacheKey(query, names, preferences)}.json`);
      const cacheable = !request.retry && ttl > 0;
      const cached = cacheable ? await readState(path, ttl) : null;
      send({ type: 'start', names });
      const update = (state: QueryState) => send({ type: 'results', results: state.results, errors: state.errors, pending: state.pending });
      if (cached && !cached.pending.length && !Object.keys(cached.errors).length) {
        update(cached);
        return;
      }
      const state = await queryProviders(query, selected, update);
      if (cacheable && !cancellation.signal.aborted && !Object.keys(state.errors).length) {
        await mkdir(dirname(path), { recursive: true, mode: 0o700 })
          .then(() => saveState(path, state)).catch(() => {});
      }
    } catch (error) {
      send({ type: 'error', message: error instanceof Error && /[\u4e00-\u9fff]/u.test(error.message) ? error.message : '暂时无法翻译，请检查设置后重试' });
    }
    return;
  }
}
