# FelixDict for Alfred

Dictionary lookup, prefix completion, and translation inside Alfred. No translation API key required.

## Requirements

macOS, Alfred 5 Powerpack, and Node.js 18+.

If Node.js is missing, press Enter on the installation hint to open [Alfred's dependency installation guide](https://www.alfredapp.com/help/kb/install-dependencies/). If an existing installation is not detected, set `node_path` to the absolute path of the Node.js executable.

## Getting started

Open Alfred and type:

- `fd hello`: dictionary definitions, pronunciation, and translations.
- `fd trans`: Youdao suggestions; select a candidate and press Tab to complete it and look it up.
- `fd :ja 你好`: translate into Japanese; targets such as `:en` and `:fr` are also supported.

## Shortcuts

- **Enter**: copy the selected definition, translation, or complete suggested word.
- **⌘Enter**: speak the query word, translation, or suggestion while keeping the window open.
- **⌘L**: show the selected row's available full text in Large Type without querying again.
- **Tab**: complete a selected suggestion and query its detailed entry.

## Settings and notes

Providers default to `Youdao,Google,Bing`. Edit `providers` to change them. The preferred target is `zh`, with `en` as the secondary language. Use `:language text` to override the target for one query.

Queries require internet access and depend on network conditions and upstream endpoints. Some Youdao translation language pairs are unsupported; one provider's failure does not hide other results. Queries and results are cached locally without encryption.

[Full illustrated guide](https://github.com/AndreGeng/FelixDict/blob/main/apps/alfred/README.en.md) · [Downloads and updates](https://github.com/AndreGeng/FelixDict/releases) · [Report an issue](https://github.com/AndreGeng/FelixDict/issues)
