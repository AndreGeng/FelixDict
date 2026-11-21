(() => {
  const root = document.getElementById('fd-quick');
  const find = selector => root.querySelector(selector);
  const panel = find('.window');
  const titlebar = find('.bar');
  const brand = find('.brand');
  const source = find('#fdq-source');
  const language = find('#fdq-language');
  const count = find('#fdq-count');
  const message = find('#fdq-message');
  const results = find('#fdq-results');
  const compare = find('#fdq-compare');
  const pin = find('#fdq-pin');
  const pinHint = find('#fdq-pin-hint');
  const run = find('#fdq-run');
  const feedback = find('#fdq-feedback');
  const send = (type, data = {}) => window.webkit.messageHandlers.felixdict.postMessage({ type, ...data });
  const languages = {
    zh: '简体中文', en: '英语', ja: '日语', ko: '韩语', fr: '法语', de: '德语',
    es: '西班牙语', it: '意大利语', pt: '葡萄牙语', ru: '俄语', ar: '阿拉伯语',
  };
  const names = { YoudaoTranslate: '有道', Google: 'Google' };
  const cards = new Map();
  let job;
  let id = 0;
  let shown = [];
  let first;
  let status = '输入原文即可翻译。';
  let noticeTimer;
  let lastLayout;

  for (const [code, label] of Object.entries(languages)) {
    language.add(new Option(label, code));
  }

  function element(tag, text, className) {
    const item = document.createElement(tag);
    item.textContent = text;
    if (className) item.className = className;
    return item;
  }

  function button(label, description, handler, className = 'quiet') {
    const item = element('button', label, className);
    item.type = 'button';
    item.setAttribute('aria-label', description);
    item.addEventListener('click', handler);
    return item;
  }

  for (const [key, name] of Object.entries(names)) {
    const card = element('article', '', 'result');
    const header = element('div', '', 'row between');
    const actions = element('div', '', 'row');
    const body = element('p', '', 'response');
    const copy = button('复制', `复制 ${name} 译文`, () => send('copy', { text: body.textContent }), 'action');
    const play = button('朗读', `朗读 ${name} 译文`, () => send('speak', { text: body.textContent, language: body.lang }));
    const retry = button('重试', `重试 ${name}`, () => translate(key));
    actions.append(play, copy, retry);
    header.append(element('h3', name), actions);
    card.append(header, body);
    results.append(card);
    cards.set(key, { card, body, copy, play, retry, state: '' });
  }

  function setCard(key, state, text = '') {
    const card = cards.get(key);
    card.state = state;
    card.body.dataset.status = state;
    card.body.textContent = state === 'pending' ? '查询中…' : text;
    card.body.lang = state === 'ready' ? (job.target === 'zh' ? 'zh-CN' : job.target) : 'zh-CN';
    if (state === 'ready' && !first) first = key;
  }

  function render() {
    const expanded = panel.dataset.expanded === 'true';
    const complete = shown.filter(key => cards.get(key).state === 'ready').length;
    count.textContent = shown.length ? `${complete} / ${shown.length} 已返回` : '';
    for (const [key, card] of cards) {
      card.card.hidden = !shown.includes(key) || (!expanded && key !== first);
      card.play.hidden = card.copy.hidden = card.state !== 'ready';
      card.retry.hidden = card.state !== 'error';
      card.retry.disabled = Boolean(job);
    }
    message.textContent = !expanded && !first && shown.length && job ? '正在等第一条译文…'
      : !expanded && !first && shown.length && !job ? '暂未收到译文，可展开查看详情和重试。'
      : status;
    message.hidden = !message.textContent;
    run.disabled = !source.value.trim();
  }

  function reset(text) {
    if (job) send('cancel');
    job = undefined;
    shown = [];
    first = undefined;
    status = text;
    render();
  }

  function translate(retry) {
    const text = source.value.trim();
    if (!text) return;
    if (text.length > source.maxLength) {
      reset('原文不能超过 2000 字符。');
      return;
    }
    if (!retry) reset('正在查询…');
    job = { id: ++id, text, target: language.value, ...(retry ? { retry } : {}) };
    if (retry) setCard(retry, 'pending');
    render();
    send('translate', job);
  }

  function setExpanded(expanded) {
    panel.dataset.expanded = String(expanded);
    compare.setAttribute('aria-expanded', String(expanded));
    compare.textContent = expanded ? '← 收起对照' : '比较译文 →';
    render();
    reportLayout();
  }

  function reportLayout() {
    const height = Math.ceil(panel.getBoundingClientRect().height);
    const expanded = panel.dataset.expanded === 'true';
    const layout = `${expanded}:${height}`;
    if (layout === lastLayout) return;
    lastLayout = layout;
    send('layout', { height, expanded });
  }

  function reportTitlebar() {
    const { top, bottom } = titlebar.getBoundingClientRect();
    // Start after the native controls and end at the pin button.
    const { left } = brand.getBoundingClientRect();
    const { left: right } = pin.getBoundingClientRect();
    send('titlebar', { dragRegion: [left, top, right, bottom] });
  }

  function notify(text, error) {
    clearTimeout(noticeTimer);
    feedback.textContent = text;
    feedback.classList.toggle('error', Boolean(error));
    noticeTimer = setTimeout(() => { feedback.textContent = ''; }, 2200);
  }

  function receiveQuery(event) {
    if (event.id !== job?.id) return;
    if (event.type === 'start') {
      if (!job.retry) shown = event.names;
      event.names.forEach(key => setCard(key, 'pending'));
      status = '';
    } else if (event.type === 'results') {
      Object.entries(event.results).forEach(([key, value]) => setCard(key, 'ready', value));
      Object.entries(event.errors).forEach(([key, value]) => setCard(key, 'error', value));
      if (!event.pending.length) job = undefined;
    } else if (event.type === 'error') {
      for (const key of shown) {
        if (cards.get(key).state === 'pending') setCard(key, 'error', event.message);
      }
      status = event.message;
      job = undefined;
    }
    render();
  }

  window.felixdictReceive = event => {
    if (event.type === 'init') {
      if (Number.isFinite(event.titlebarCenter) && event.titlebarCenter >= 14) {
        root.style.setProperty('--titlebar-center', `${event.titlebarCenter}px`);
      }
      const prefix = event.text.match(/^:([a-z]+)\s+/i);
      const target = prefix?.[1].toLowerCase();
      language.value = target && Object.prototype.hasOwnProperty.call(languages, target) ? target : '';
      source.value = language.value ? event.text.slice(prefix[0].length) : event.text;
      render();
      source.focus();
      if (source.value.trim()) translate();
    } else if (event.type === 'pin') {
      pin.setAttribute('aria-pressed', String(event.pinned));
      pinHint.textContent = event.pinned ? '取消置顶' : '窗口置顶';
    } else if (event.type === 'notice') {
      notify(event.message, event.error);
    } else {
      receiveQuery(event);
    }
  };

  run.addEventListener('click', () => translate());
  compare.addEventListener('click', () => setExpanded(panel.dataset.expanded !== 'true'));
  pin.addEventListener('click', () => send('pin', { pinned: pin.getAttribute('aria-pressed') !== 'true' }));
  language.addEventListener('change', () => translate());
  source.addEventListener('input', () => reset(source.value.trim() ? '按回车翻译。' : '输入原文即可翻译。'));
  source.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      translate();
    }
  });
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.isComposing || event.defaultPrevented || event.target.tagName === 'SELECT') return;
    event.preventDefault();
    if (panel.dataset.expanded === 'true') {
      setExpanded(false);
      compare.focus();
    } else {
      send('close');
    }
  });

  new ResizeObserver(reportLayout).observe(panel);
  new ResizeObserver(reportTitlebar).observe(titlebar);
  window.addEventListener('scroll', reportTitlebar, { passive: true });
  render();
  send('ready');
})();
