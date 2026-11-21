## 更新内容 / What's new

- **Alfred 快译窗口 / Alfred translation window**。输入 `fdt` 打开窗口，输入 `fdt 文本` 立即翻译。也可在其他应用中选中文字，通过 **Universal Actions → FelixDict 对照翻译** 直接翻译。/ Enter `fdt` to open the window, use `fdt text` to translate immediately, or invoke **FelixDict 对照翻译** from Universal Actions with selected text.
- **从列表一键打开 / Shortcut from results**。在 `fd` 结果列表按 **⌥↩（Option + 回车）**，打开快译窗口并带入当前原文和指定的目标语种。试试 `fd :ja 你好`。/ Press **⌥↩ (Option + Return)** in the `fd` results to open the window with the current source text and explicit target language. Try `fd :ja 你好`.
- **并排比较译文 / Side-by-side comparison**。窗口先显示第一条译文，点击 **比较译文** 后可并排查看有道和 Google 的结果，并单独重试失败的来源。图钉可将窗口置于当前桌面的其他普通窗口上方，深浅色随 macOS 外观切换。/ The first translation appears as soon as it arrives. Click **比较译文** to compare Youdao and Google, and retry individual providers. Pin the window above ordinary app windows on the current desktop. The window follows macOS appearance.
- **翻译来源 / Translation providers**。Alfred、Vicinae 和 Raycast 的 Bing 翻译已下线，Bing 中英词典仍可使用。翻译由有道和 Google 提供。/ Bing translation has been removed across all three launchers. Bing English–Chinese dictionary lookup remains available. Translation uses Youdao and Google.

## 下载与安装 / Downloads and installation

| 附件 / Asset | 安装方式 / Installation |
| --- | --- |
| `Alfred-FelixDict-0.3.0.alfredworkflow` | 双击导入。需要 Alfred 5 或 6 Powerpack 和 Node.js 18+，快译窗口需要 macOS 12+。/ Double-click to import. Requires Alfred 5 or 6 Powerpack and Node.js 18+. The translation window requires macOS 12+. |
| `FelixDict-Vicinae-0.3.0.zip` | 解压，按包内 `INSTALL.md` 复制扩展目录。/ Extract and copy the extension as described in the included `INSTALL.md`. |
| `FelixDict-Raycast-source-0.3.0.zip` | 解压后执行 `npm ci` 和 `npm run dev:raycast`，需要 Node.js 22.22.2+。/ Extract, then run `npm ci` and `npm run dev:raycast` with Node.js 22.22.2+. |
| `FelixDict-Raycast-0.3.0.rayext` | 预编译包。已验证的安装路径是上面的源码 ZIP。/ Precompiled bundle. The source ZIP is the tested installation route. |
| `SHA256SUMS` | 四个安装包的 SHA-256 校验值。/ SHA-256 checksums for the four packages. |

完整用法见 [中文 README](https://github.com/AndreGeng/FelixDict/blob/v0.3.0/README.md#快译与译文对照) 和 [English README](https://github.com/AndreGeng/FelixDict/blob/v0.3.0/README.en.md#quick-translation-and-side-by-side-comparison)。
