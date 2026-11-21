# FelixDict for Alfred

Dictionary lookup, prefix completion, and translation inside Alfred. No translation API key required.

## Requirements

macOS, Alfred 5 or 6 with Powerpack, and Node.js 18+. The translation window requires macOS 12 or later.

If Node.js is missing, press Enter on the installation hint to open [Alfred's dependency installation guide](https://www.alfredapp.com/help/kb/install-dependencies/). If an existing installation is not detected, set `node_path` to the absolute path of the Node.js executable.

## Getting started

Open Alfred and type:

- `fd hello`: dictionary definitions, pronunciation, and translations.
- `fd trans`: Youdao suggestions; select a candidate and press Tab to complete it and look it up.
- `fd :ja 你好`: translate into Japanese; targets such as `:en` and `:fr` are also supported.
- `fdt`: open the translation window. Run `fdt text` to start translating immediately, or select text and choose **FelixDict 对照翻译** in Universal Actions.

The window shows the first translation as soon as it arrives. Use **比较译文** to expand to two columns, see the other sources, or retry a failed source. The window automatically follows the macOS light or dark appearance. The pin keeps this window above ordinary app windows on the current desktop.

## Shortcuts

- **Enter**: copy the selected definition, translation, or complete suggested word.
- **⌘Enter**: speak the query word, translation, or suggestion while keeping the window open.
- Select **打开对照翻译窗口** in the `fd` results and press Enter to carry over the source text and explicit target language.
- **⌘L**: show the selected row's available full text in Large Type without querying again.
- **Tab**: complete a selected suggestion and query its detailed entry.

## Settings and notes

Providers default to `Youdao,Google,Bing`. Edit `providers` to change them. Youdao and Google provide translations. Bing provides English–Chinese dictionary lookup. The preferred target is `zh`, with `en` as the secondary language. Use `:language text` to override the target for one query.

Queries require internet access and depend on network conditions and upstream endpoints. Some Youdao translation language pairs are unsupported; one provider's failure does not hide other results. Queries and results are cached locally without encryption.

[Full illustrated guide](https://github.com/AndreGeng/FelixDict/blob/main/apps/alfred/README.en.md) · [Downloads and updates](https://github.com/AndreGeng/FelixDict/releases) · [Report an issue](https://github.com/AndreGeng/FelixDict/issues)
