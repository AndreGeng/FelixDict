# FelixDict

[中文](README.md) · **English**

FelixDict brings **dictionary lookup and translation to Alfred, Vicinae, and Raycast**. Look up definitions and pronunciation, find a word from its first few letters, translate phrases and sentences, and listen to results—all from your launcher.

If FelixDict is useful to you, consider [giving it a star on GitHub ⭐](https://github.com/AndreGeng/FelixDict) to support its continued development!

## Features

- **English–Chinese dictionary**: definitions by part of speech, British and American phonetics, word forms, and web meanings.
- **Prefix suggestions**: type the first few letters of an English word, compare candidates and their meanings, then complete the word to look it up.
- **Multilingual translation**: automatic source-language detection and 11 target languages, including Chinese, English, Japanese, Korean, and French. Set preferred targets or override them with a prefix such as `:ja`.
- **Keyboard actions**: copy, speak, and view full results without reaching for the mouse.
- **Progressive results and caching**: services run in parallel, results appear as they arrive, and repeated queries can use the local cache.

Youdao dictionary and Youdao, Google and Bing translation are enabled by default, with no API key configuration required. Dictionary lookup and prefix suggestions cover English–Chinese; other languages use translation services. Queries require an internet connection. OCR, vocabulary collections, AI translation, and a complete offline dictionary are not included.

Enabling `Youdao` includes dictionary entries, suggestions and multilingual translation, without new settings or a user API key. The web translation endpoint has language-pair restrictions; failures for unsupported pairs suggest Google/Bing while other sources remain available. See the [language test report](docs/youdao-language-support.md) for tested pairs and known failures or mistranslations.

## Which version should I use?

Alfred, Vicinae, and Raycast are keyboard-driven application launchers. FelixDict is a plugin, so install the corresponding launcher first. The table separates **operating systems supported by the launcher** from **environments tested with FelixDict**.

| Launcher | Desktop operating systems supported by the launcher | Environments tested with FelixDict | Installation |
| --- | --- | --- | --- |
| Alfred | macOS | macOS | [Alfred edition](apps/alfred/README.en.md) |
| Vicinae | Linux (Wayland / X11), macOS (Apple Silicon only, beta), Windows (since 0.29.0) | macOS, Arch Linux | [Vicinae edition](apps/vicinae/README.en.md) |
| Raycast | macOS, Windows | macOS | [Raycast edition](apps/raycast/README.en.md) |

- **macOS**: all three editions have been tested. Choose the edition for your launcher. Alfred requires Alfred 5 Powerpack and Node.js 18+.
- **Linux**: use the Vicinae edition, tested on Arch Linux. Other distributions and desktop environments have not been individually tested. Speech requires a configured Speech Dispatcher (`spd-say`).
- **Windows**: Vicinae and Raycast themselves support Windows. FelixDict is awaiting validation on Windows; please try it and report any issues.

Testing does not cover every OS version, hardware configuration, or desktop setup. If you encounter issues in other environments, please [report them on GitHub Issues](https://github.com/AndreGeng/FelixDict/issues) with your OS, launcher and FelixDict versions, and steps to reproduce. On Linux, also include your distribution, desktop environment, and whether you use Wayland or X11.

Launcher platform information checked on 2026-11-01: [Alfred](https://www.alfredapp.com/), [Vicinae platform overview](https://docs.vicinae.com/os-support), [Raycast](https://www.raycast.com/), and [Raycast for Windows](https://www.raycast.com/windows).

## Downloads and installation

Choose **v0.2.0 or later** from [GitHub Releases](https://github.com/AndreGeng/FelixDict/releases) and download the asset for your launcher:

| Launcher | Release asset | Installation |
| --- | --- | --- |
| Alfred | `Alfred-FelixDict-*.alfredworkflow` | Double-click to import; requires Powerpack and Node.js 18+ |
| Vicinae | `FelixDict-Vicinae-*.zip` | Extract and copy the precompiled extension as described in INSTALL.md; no build needed |
| Raycast | `FelixDict-Raycast-source-*.zip` | Extract, run `npm ci` then `npm run dev:raycast`; requires Node.js 22.22.2+ |

An official precompiled `.rayext` bundle is also provided, but the tested Raycast installation route is the source ZIP; double-click import is not guaranteed. Download these named assets instead of GitHub's automatic Source code archives. Extensions are not yet listed in extension stores. Checksums are in `SHA256SUMS`.

## Alfred

For **macOS with Alfred 5 Powerpack**. Requires Node.js 18+ at runtime.

Open Alfred and type the keyword followed by your query:

```text
fd hello
fd trans
fd :ja 你好
```

**Definitions and pronunciation**

![Dictionary definitions and phonetics in Alfred](docs/screenshots/dictionary.jpg)

**Prefix suggestions**: type `fd trans` and use the meanings to find the word you need.

![Prefix suggestions in Alfred](docs/screenshots/suggestions.jpg)

**Multilingual translation**: use `fd :ja 你好` to translate into Japanese.

![Japanese translation in Alfred](docs/screenshots/translation.jpg)

Enter copies, ⌘Enter speaks, ⌘L opens Large Type, and Tab completes a suggested word.

→ [Alfred installation and usage guide](apps/alfred/README.en.md)

## Vicinae

Search for `fd` in Vicinae, select **FelixDict**, and press Enter to open the command. Then type `hello`, `trans`, or `:ja 你好` for live results and suggestions.

**Command entry**: the search result shows the `fd` alias and FD icon.

![FelixDict command with the fd alias](docs/screenshots/vicinae-entry.jpg)

**Prefix suggestions**: candidates and their meanings appear together in the list.

![FelixDict prefix suggestions in Vicinae](docs/screenshots/vicinae-suggestions.jpg)

Enter copies, ⌘Enter speaks, ⌘L opens scrollable full-text details, and ⌘O completes a candidate. On Linux, use Ctrl instead of ⌘. Vicinae displays titles and subtitles on the same line, unlike Alfred's two-line rows.

The Vicinae edition has been tested on macOS and Arch Linux; screenshots were captured on macOS. Linux speech requires a configured Speech Dispatcher (`spd-say`).

→ [Vicinae installation and usage guide](apps/vicinae/README.en.md)

## Raycast

For **macOS with Raycast**. Search for `fd` or `FelixDict`, press Enter to open the command, then type a word or sentence. You can set the command's Alias to `fd` under Raycast Settings → Extensions.

**Prefix suggestions and phonetics**

![Prefix suggestions and phonetics in Raycast](docs/screenshots/raycast-suggestions.jpg)

**Multilingual translation**: type `:ja hello` for a Japanese translation.

![Japanese translation in Raycast](docs/screenshots/raycast-translation.jpg)

Enter copies, ⌘Enter speaks while keeping the window open, ⌘L opens full-text details, and ⌘O completes a candidate. As in Vicinae, live dictionary suggestions appear inside the command.

Currently installed from source, not yet available in the Raycast Store. Run `npm ci` and `npm run dev:raycast` from the repository root. After a successful build, you can stop the development command; the extension remains installed.

→ [Raycast installation and usage guide](apps/raycast/README.en.md)

Screenshots show real query results. Both language editions use the same Chinese interface screenshots; online results may vary. Dictionary rows speak the query word, translation rows speak the translated text, and suggestions speak the complete candidate.

## Structure

```text
apps/
  alfred/                 CLI, Alfred JSON adapter, launcher, and packaging
  vicinae/                Vicinae React UI and extension installation
  raycast/                Raycast React UI and extension build
packages/
  core/                   Languages, providers, query state, cache utilities, result model
test/                     TypeScript regressions and Python packaging tests
docs/                     Shared documentation assets
```

npm workspaces manages dependencies with one root `package-lock.json`. Apps import `@felixdict/core` rather than another app's source files. The core has no launcher SDK dependency; Alfred JSON and modifier fields belong to the Alfred adapter.

## Development

Requires Node.js 22.22.2+, npm, and Python 3 for Alfred packaging. All Node source, helper scripts, and tests use TypeScript with strict type checking.

```sh
npm ci
npm run typecheck  # TypeScript + Python (Pyright)
npm test
npm run build:alfred
npm run build:vicinae
npm run build:raycast
npm run package:release
npm run test:release
```

- `build:alfred` compiles core and CLI, then produces `dist/Alfred-FelixDict-0.2.0.alfredworkflow`. It does not import or replace your installed workflow.
- `build:vicinae` compiles core, then builds and installs the extension into your local Vicinae directory.
- `build:raycast` compiles and validates the extension without importing it; `dev:raycast` builds and imports it into local Raycast.
- `build` builds all three apps, including the local Vicinae installation.
- `test` compiles runtime code, runs TypeScript tests, and checks Alfred packaging.

Generated `dist/` files are not committed. The Alfred archive includes compiled JavaScript and a local copy of the shared package; users need no TypeScript or npm install. Its runtime still supports Node.js 18+.
Vicinae bundles shared code and does not depend on the checkout at runtime.

## License and attribution

MIT. See [THIRD_PARTY.md](THIRD_PARTY.md) for upstream protocol and source attribution.

See [release workflow](docs/RELEASING.md).
