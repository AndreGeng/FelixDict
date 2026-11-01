# FelixDict v0.2.1

## 更新内容 / What's new

- **有道多语言翻译**：启用 Youdao 即可使用词典、联想和多语言翻译；受上游语种对支持范围限制，失败不影响其他来源。/ Youdao now supports multilingual translation alongside dictionary lookup and suggestions; language-pair restrictions still apply.
- **默认启用 Bing**：默认来源为 `Youdao,Google,Bing`，可在设置中调整。已有用户如保存了自定义来源，请按需手动加入 Bing。/ Bing is enabled by default; existing custom provider settings are preserved.
- **Google / Bing 词典**：普通单词和短语查询新增词性释义、读音等内容。Bing 可提供词形变化和网络释义；Google 可显示词典原形，具体字段随词条变化。/ Added Google and Bing dictionary content, with pronunciation and parts of speech where available. Bing can supply word forms and web definitions; Google can supply a dictionary base form.
- **联想提示**：候选明确显示「有道联想」，Alfred 增加「Tab 补全」操作提示；Enter 仍统一用于复制。/ Suggestions now identify Youdao as their source; Alfred shows a Tab completion hint while Enter continues to copy.
- **安装与说明**：Alfred 缺少 Node.js 时提供官方安装指引；Vicinae / Raycast 增加版本信息页；更新平台验证范围和列表行为说明。/ Added Alfred Node.js installation guidance, Vicinae/Raycast build information, and clearer platform and result-list documentation.

## 下载与安装 / Downloads and installation

| 附件 / Asset | 安装方式 / Installation |
| --- | --- |
| `Alfred-FelixDict-0.2.1.alfredworkflow` | macOS：双击导入 Alfred 5 Powerpack，需要 Node.js 18+。/ Double-click to import; requires Alfred 5 Powerpack and Node.js 18+. |
| `FelixDict-Vicinae-0.2.1.zip` | 解压，按 INSTALL.md 复制预编译扩展目录，无需编译。/ Extract and copy the precompiled extension as described in INSTALL.md; no build needed. |
| `FelixDict-Raycast-source-0.2.1.zip` | 已验证的安装路径：解压，运行 `npm ci`、`npm run dev:raycast`，需要 Node.js 22.22.2+。/ Tested installation route: extract, run `npm ci`, then `npm run dev:raycast`; requires Node.js 22.22.2+. |
| `FelixDict-Raycast-0.2.1.rayext` | 官方格式的预编译包；双击直接导入尚未验证，建议使用上述源码 ZIP。/ Precompiled bundle in Raycast's official format; direct import remains unverified. Use the source ZIP above. |
| `SHA256SUMS` | 四个下载包的 SHA-256 校验值。/ SHA-256 checksums for the four downloads. |

请下载上述附件，而非 GitHub 自动生成的 Source code 归档。三个版本尚未上架官方扩展商店。/ Download the named assets above rather than GitHub's automatic source archives. The extensions are not yet listed in official stores.

## 平台与验证范围 / Platforms and validation

- Alfred 仅支持 macOS；Vicinae 本身支持 Linux、macOS（Apple Silicon，Beta）和 Windows；Raycast 本身支持 macOS 和 Windows。/ Alfred supports macOS; Vicinae supports Linux, macOS (Apple Silicon, beta), and Windows; Raycast supports macOS and Windows.
- FelixDict 已在 macOS 验证，Vicinae 版本另有 Arch Linux 验证记录。Windows 和其他 Linux 环境尚待验证，遇到问题欢迎提交 [Issue](https://github.com/AndreGeng/FelixDict/issues)。Linux 朗读需要 Speech Dispatcher（`spd-say`）。/ FelixDict has been tested on macOS, with additional Arch Linux validation for Vicinae. Windows and other Linux environments await validation. Linux speech requires Speech Dispatcher (`spd-say`).
- 本次发布前，三端构建、类型检查及自动化回归通过；真实联网检查覆盖 `inspire`、`run`、`:ja hello` 和英语句子，三家服务均成功返回。/ Pre-release builds, type checks, and automated regressions passed. Live requests for words, a Japanese target, and an English sentence succeeded across the three providers.
- 当前版本的三端原生窗口 E2E 未在本次发布流程中完成，受电脑控制权限限制；不将 CLI 和动作数据检查视为界面验收。/ Native-window E2E for this version was not completed in this release run because computer-control access was denied. CLI and action-payload checks are not treated as UI validation.

## 已知限制 / Known limitations

查询需要联网，网站接口可能随网络、限流或上游改动失效；有道部分语种对不受支持。Google 的读音标记不一定是 IPA，也没有完整词形变化表。联想释义可能被上游截断，补全候选后可查询详细词条。/ Queries require internet access and depend on website endpoints. Some Youdao language pairs are unsupported. Google readings are not necessarily IPA, and a complete inflection table is unavailable. Suggestion glosses may be shortened by the provider; complete the candidate to query its detailed entry.

回退时重新安装旧版附件即可，无需删除偏好或缓存。Vicinae 用户可将旧扩展目录备份到 extensions 目录之外。/ To roll back, reinstall an earlier release without deleting preferences or caches. Keep any Vicinae extension backup outside the extensions directory.
