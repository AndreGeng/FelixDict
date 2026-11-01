# FelixDict for Alfred

> **Vicinae version**: this repository also includes [FelixDict](../vicinae/README.en.md), sharing dictionary and prefix suggestions with a separate build and installation. The instructions below cover Alfred.

[中文](README.md) · **English**

Look up words, complete partial spellings, and translate across languages inside Alfred. Includes an English–Chinese dictionary and automatic translation for Japanese, Korean, French, and more.
No running Easydict or Raycast app and no translation API key required.

![Definitions, pronunciation and related words for hello in Alfred](../../docs/screenshots/dictionary.jpg)

## Features

- **Dictionary lookup**: dictionary content from Youdao, Google, and Bing, including parts of speech, pronunciation, and word forms where available. Fields vary by provider and entry; see Configuration below.
- **Prefix suggestions**: find a word from its first few letters, with Chinese glosses. Press Tab to complete it and look up the full entry.
- **Multilingual translation**: Youdao, Google and Bing translation are enabled by default. The source language is detected automatically. Configure a preferred target and secondary language, or specify the target per query. Defaults retain Chinese–English translation.
- **Keyboard actions**: Enter to copy, ⌘Enter to speak, and ⌘L to view the full result in Large Type.
- **Code identifiers**: split `camelCase`, `HTTPServer`, and `snake_case` before lookup.
- **Progressive results and caching**: providers run in parallel. Available results appear immediately and are reordered by the list rules; failures do not hide successful results.

A standalone Alfred Workflow with an English–Chinese dictionary and multilingual translation. OCR, vocabulary lists, AI translation, and a complete offline dictionary are not included.

## Installation

Download `Alfred-FelixDict-*.alfredworkflow` from [Releases](https://github.com/AndreGeng/FelixDict/releases), v0.2.0 or later, and double-click to import; no build needed. Source build instructions are also provided below.

Requires **macOS, Alfred 5 with Powerpack, and Node.js 18+**. There are no npm runtime dependencies.

Alfred supports macOS only, and the FelixDict Workflow has been tested on macOS. For launcher platforms, tested environments, and how to report issues in other environments, see the [platform and validation table](../../README.en.md#which-version-should-i-use).

1. Build the package from the project directory:

   ```bash
   npm ci
   npm run build:alfred
   ```

2. Double-click `dist/Alfred-FelixDict-*.alfredworkflow` to import or update it in Alfred.
3. Open Alfred and enter `fd hello`. The default keyword is `fd`.
4. If Node.js is missing, press Enter on the installation hint to open [Alfred’s official dependency installation guide](https://www.alfredapp.com/help/kb/install-dependencies/), install Node.js, then search again. If Node.js is already installed but not detected, set its absolute path in `node_path` under **Configure Workflow**.

The launcher checks `~/.local/bin/node`, `/opt/homebrew/bin/node`, `/usr/local/bin/node`, and `PATH`.
Building from source requires Node.js 22.22.2+, npm, and Python 3. Run the commands above at the repository root. An existing package only needs Node.js 18+; no development dependency installation is required.

The Workflow does not install software itself. Alfred’s Dependencies Manager handles dependencies for Gallery workflows; FelixDict is not yet listed in the Gallery.

The install/update window shows a concise getting-started guide. This page retains the full illustrated documentation; the archive does not include documentation screenshots.

## Usage

```text
fd hello
fd trans
fd look forward to
fd 你好
fd getHTTPServer
fd :ja hello
fd :fr 你好
fd The request was cancelled because a newer query was started.
```

### Multilingual translation

**Automatic translation**: the source language is detected automatically. Text translates into your **preferred target language**, or into your **secondary language** when the source already matches the preferred target.
The initial settings are `zh` (Simplified Chinese) and `en` (English), preserving Chinese-to-English and other-languages-to-Chinese behavior.

Set `target_language` and `secondary_language` in **Configure Workflow**, using two different language codes from the table below.
For example, with `en` and `ja`, `fd 你好` translates into English, `fd hello` into Japanese, and `fd :fr hello` still into French.
An explicit `:language` prefix overrides both settings. Each language pair uses a separate cache, so changing either setting does not reuse old translations.

**Explicit target**: use `fd :language-code text`. Use an ASCII colon (`:`) and a space between the language code and the text.

```text
fd 今日はいい天気です
fd 안녕하세요
fd Bonjour, comment allez-vous ?
fd :ja 你好
fd :ko 你好
fd :fr 你好
fd :en 東京
fd :zh Bonjour
```

Example queries and outputs (online translations may vary):

| Input | Example output |
| --- | --- |
| `fd 今日はいい天気です` | 今天天气很好 |
| `fd 안녕하세요` | 你好 |
| `fd :ja hello` | こんにちは |
| `fd :fr 你好` | Bonjour |
| `fd :de 谢谢` | Danke |

The following 11 target languages can be selected explicitly:

| Target language | Code | Target language | Code |
| --- | --- | --- | --- |
| Simplified Chinese | `zh` | English | `en` |
| Japanese | `ja` | Korean | `ko` |
| French | `fr` | German | `de` |
| Spanish | `es` | Italian | `it` |
| Portuguese | `pt` | Russian | `ru` |
| Arabic | `ar` | | |

Enable Youdao, Google or Bing; Youdao, Google and Bing translation are enabled by default. The translation service detects the source language. Short words, kanji-only text, and mixed languages can be ambiguous; use a prefix such as `:zh` or `:en` to fix the target.
Explicit targets show translation results only. Youdao's definitions, phonetics, and prefix suggestions retain their existing English–Chinese scope.
`⌘Enter` speaks the translation for translation results and the query word for dictionary results. Japanese containing kana, Korean, and Chinese use a matching installed system voice.

![Japanese translation in Alfred](../../docs/screenshots/translation.jpg)

### Find a word from its prefix

Suggestions appear for **2–40 English letters** when Youdao is enabled. For example, `fd trans`:

![Prefix suggestions for trans, including transfer and transition with Chinese glosses](../../docs/screenshots/suggestions.jpg)

Up to six candidates appear after the first definition of the current query. Select one with ↑ / ↓ and press **Tab** to complete the word and retrieve its detailed entry.
Candidates are labeled “有道联想” (Youdao suggestions), with a “Tab 补全” (Tab to complete) hint alongside the action shortcuts. Enter still copies the complete candidate word, keeping its copy action consistent with ordinary results. Candidates also support speech and Large Type. Chinese text, sentences, and inputs containing symbols do not trigger suggestions. A suggestion failure does not interrupt ordinary lookup.

Dictionary meanings, word forms, and web definitions occupy separate rows, with translations listed separately; results are not collapsed into one row per provider. Dictionaries are ordered Youdao, Google, then Bing, followed by translations in the same provider order. Suggestions appear after the first available result, and errors and loading indicators come last. No empty slots are reserved, so later responses can move existing rows.

### Keyboard shortcuts

| Key | Dictionary / translation result | Suggested word |
| --- | --- | --- |
| `↑` / `↓` | Select a result | Select a candidate |
| `Enter` | Copy the selected definition or translation | Copy the complete candidate word |
| `⌘Enter` | Speak the query word for dictionary results or translated text for translations; keep Alfred open | Speak the complete candidate; keep Alfred open |
| `⌘L` | Show the full selected result in Large Type | Show the candidate and its supplied gloss in Large Type |
| `Tab` | — | Complete the word and look it up |
| `Esc` | Dismiss the query | Dismiss the query |

In Large Type, the first Esc returns to the result list; a second Esc dismisses it. Speech uses the local macOS voice.
⌘L displays the full text already available for the selected row, without querying again or aggregating every result from that provider. The suggestion endpoint may itself return shortened glosses. Press Tab to retrieve the full dictionary entry.

### Phrases and sentences

![Phrase definitions for look forward to in Alfred](../../docs/screenshots/phrase.jpg)

You can also select text in another app and use **Universal Actions → FelixDict 查词 / 翻译**.
Alfred's global activation and Universal Actions shortcuts are configured in Alfred. This Workflow does not assign a fixed global hotkey.

## Configuration

Open **Alfred Preferences → Workflows → FelixDict for Alfred → Configure Workflow**.

| Variable | Default | Description |
| --- | --- | --- |
| `keyword` | `fd` | Lookup keyword; you can use `yd` if it does not conflict with another Workflow |
| `providers` | `Youdao,Google,Bing` | Comma-separated list: `Youdao` (dictionary and translation), `Google`, `Bing` |
| `target_language` | `zh` | Preferred target language code, such as `en` or `ja` |
| `secondary_language` | `en` | Target when the source matches the preferred language; must be different |
| `node_path` | Auto-detected | Absolute path to the Node.js executable |
| `cache_hours` | `24` | 0–168 hours; 0 disables long-term caching but retains brief state for the active query |

Enabling `Youdao` includes dictionary entries, suggestions and multilingual translation, without new settings or a user API key. The web translation endpoint has language-pair restrictions; failures for unsupported pairs suggest Google/Bing while other sources remain available. See the [language test report](../../docs/youdao-language-support.md) for tested pairs and known failures or mistranslations.

Plain word and short-phrase queries also fetch dictionary data for enabled providers: Google supplies a reading, translations grouped by part of speech, and source-language definitions; Bing’s English–Chinese dictionary supplies US/UK phonetics, parts of speech, inflections, and web definitions. Fields depend on the entry. Google can show a dictionary base form that differs from the input (for example, went → go), but no complete inflection table is available in this integration; its reading is not necessarily IPA. Dictionary and translation requests fail independently. Explicit `:language` targets and long sentences use Google/Bing translation only; Bing dictionary lookup runs only for Chinese or English targets. Removing `Google` or `Bing` disables both its dictionary and translation.

Language preferences apply to Youdao/Google/Bing translation. Youdao dictionary entries and prefix suggestions remain English–Chinese; removing `Youdao` from `providers` disables its dictionary entries, suggestions and translation together.

Youdao supplies dictionary entries, prefix suggestions and multilingual translation; Google and Bing supply dictionary lookup and multilingual translation. Bing is enabled by default. Live translation and Alfred CLI checks passed in the current development environment on 2026-11-01; the earlier failure could not be reproduced. See [VERIFICATION.md](../../VERIFICATION.md) for scope and details.
These providers use website endpoints. Availability can change with network conditions, rate limits, and upstream protocol changes.

`curl` inherits `HTTPS_PROXY` and `ALL_PROXY`; it does not automatically read macOS system proxy settings.
If Google is unreachable, set `providers` to `Youdao`, or configure a proxy in the Workflow environment.

## Troubleshooting

### No results, or Node.js is missing

Check the network, enabled providers, and `node_path`. This terminal command queries providers directly and prints Alfred JSON:

```bash
node apps/alfred/dist/cli.js --wait hello
```

## Privacy and runtime behavior

Query text is sent only to enabled Youdao, Google, or Bing services. With Youdao enabled, eligible English input also requests prefix suggestions.
There is no additional telemetry. The Workflow does not read browser data, accounts, credentials, Easydict / Raycast settings, or proactively read the clipboard.
Copying happens only when a copy action is executed; speech runs only after `⌘Enter`.

Cache files contain query text and results, have permissions `0600`, and are **not encrypted**.
The Workflow uses Alfred's `alfred_workflow_cache` directory; standalone CLI usage defaults to `~/Library/Caches/local.alfred-easydict`.
Expired files are cleaned up when new queries start; without subsequent queries they may remain on disk.
Use Alfred's Workflow cache cleanup feature to remove them.

Providers run concurrently with an eight-second total deadline per provider. During a query, Alfred reads local state every 0.3 seconds without starting duplicate in-progress requests.
There is no persistent service. Requests already started may continue until completion or timeout after Alfred is dismissed.

## Development

```bash
npm test
npm run build:alfred
```

Tests use Node.js's built-in test runner and the Python standard library. They cover response decoding, candidate actions, error isolation, progressive updates, caching, and package structure.
See [VERIFICATION.md](../../VERIFICATION.md) for live provider checks and Alfred UI acceptance records.

Screenshots show the current Chinese interface in Alfred 5.8.1 on macOS. Both language editions use the same real screenshots; online results may change.

## Attribution and license

Parts of the provider code are adapted from [Raycast Easydict](https://github.com/tisfeng/Raycast-Easydict). The Alfred presentation layer, cache, and Google HTTP adapter are independently implemented.
This is not an official Easydict product and does not require the upstream apps to run. See [THIRD_PARTY.md](../../THIRD_PARTY.md) for provenance and the reviewed revision.

[MIT License](../../LICENSE) · [Upstream MIT License](../../licenses/Raycast-Easydict-MIT.txt)
