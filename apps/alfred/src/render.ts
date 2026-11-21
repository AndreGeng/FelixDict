import { resultItems } from '@felixdict/core/results';
import type { QueryState } from '@felixdict/core/types';
import { existsSync } from 'node:fs';

const hasPanel = existsSync(new URL('../panel/FelixDictPanel', import.meta.url));

export function render(query: string, state: QueryState, panelAvailable = hasPanel) {
  const results = resultItems(query, state).map(item => ({
    title: item.title,
    subtitle: item.subtitle + (item.copy !== undefined
      ? ` · ${item.completion ? 'Tab 补全  ' : ''}↩ 复制  ⌘↩ 朗读  ⌘L 全文` : ''),
    valid: item.copy !== undefined,
    ...(item.copy !== undefined ? {
      arg: item.copy, variables: { action: 'copy' },
      text: { copy: item.copy, largetype: item.fullText },
      mods: { cmd: { valid: true, arg: item.speak, subtitle: '使用 macOS 语音朗读查询内容', variables: { action: 'speak' } } }
    } : {}),
    ...(item.completion ? { autocomplete: item.completion } : {})
  }));
  if (panelAvailable) {
    results.splice(1, 0, {
      title: '打开对照翻译窗口',
      subtitle: '↩ 带入当前原文和目标语种',
      valid: true,
      arg: query,
      variables: { action: 'panel' },
    });
  }
  return { items: results, ...(state.pending.length ? { rerun: 0.3 } : {}) };
}
