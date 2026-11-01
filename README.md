# FelixDict

**中文** · [English](README.en.md)

FelixDict 是运行在 **Alfred、Vicinae 和 Raycast** 中的查词与翻译工具。输入单词查看释义和音标，只记得开头时通过联想找词，也可以翻译短语和句子、朗读结果。查询就在启动器里完成，无需另开词典应用。

如果 FelixDict 对你有帮助，欢迎在 [GitHub 上给个 Star ⭐](https://github.com/AndreGeng/FelixDict)，支持项目继续改进！

## 功能

- **中英词典**：查看多词性释义、英美音标、词形变化和网络释义。
- **单词联想**：输入英文单词的前几个字母，查看完整候选和释义，再补全查询。
- **多语言翻译**：自动识别源语言，支持中、英、日、韩、法等 11 种目标语言，可设置默认目标或用 `:ja` 等前缀临时指定。
- **键盘操作**：复制结果、朗读单词或译文、查看全文，全程可用键盘完成。
- **渐进结果与缓存**：多个服务并行查询，结果陆续显示，重复查询可使用本地缓存。

默认启用有道、Google 和 Bing 的词典与翻译，无需配置 API Key。有道 / Bing 词典及前缀联想以中英为范围；Google 词典内容随语种和词条变化，多语言查询也可使用翻译服务。查询需要联网，目前不包含 OCR、生词本、AI 翻译或完整离线词典。

启用 `Youdao` 即可同时使用有道词典、联想和多语言翻译，无需新增设置或配置 API Key。有道网页翻译受语种对限制，未能处理时会提示使用 Google / Bing，其他来源的结果仍可使用。 测试范围与已知语种对、错译问题见[语言实测记录](docs/youdao-language-support.md)。

普通单词或短语查询会同时获取所启用来源的词典内容：Google 提供读音标记、按词性分组的译义和原文释义；Bing 中英词典提供英美音标、词性释义、词形变化和网络释义。字段以实际词条为准；Google 可显示不同于输入的词典原形（例如 went → go），但目前未接到完整的词形变化列表；其读音标记不一定是国际音标。词典查询与翻译独立，一个失败不影响另一个。指定 `:语言` 目标或输入长句时，Google / Bing 仅查询翻译；Bing 词典仅在目标为中文或英文时查询。移除 `Google` / `Bing` 会同时关闭该来源的词典与翻译。

## 选哪个版本？

Alfred、Vicinae 和 Raycast 都是用键盘呼出的应用启动器；FelixDict 是安装在其中的插件，需要先安装对应启动器。下表分别列出**启动器本身支持的系统**和**FelixDict 已验证的环境**。

| 启动器 | 启动器支持的桌面系统 | FelixDict 已验证的环境 | 安装说明 |
| --- | --- | --- | --- |
| Alfred | macOS | macOS | [Alfred 版](apps/alfred/README.md) |
| Vicinae | Linux（Wayland / X11）、macOS（仅 Apple Silicon，Beta）、Windows（0.29.0 起） | macOS、Arch Linux | [Vicinae 版](apps/vicinae/README.md) |
| Raycast | macOS、Windows | macOS | [Raycast 版](apps/raycast/README.md) |

- **macOS**：三个版本均已验证，按你使用的启动器选择。Alfred 版需要 Alfred 5 Powerpack 和 Node.js 18+。
- **Linux**：使用 Vicinae 版，已在 Arch Linux 验证；其它发行版和桌面环境尚未逐一验证。朗读需要配置 Speech Dispatcher（`spd-say`）。
- **Windows**：Vicinae 和 Raycast 本身支持 Windows；FelixDict 在 Windows 上尚待验证，欢迎试用并反馈问题。

已验证环境不代表覆盖所有系统版本、硬件和桌面配置。在其它环境使用时如遇问题，欢迎通过 [GitHub Issues](https://github.com/AndreGeng/FelixDict/issues) 反馈，并附上系统版本、启动器版本、FelixDict 版本和复现步骤；Linux 用户也请注明发行版、桌面环境及 Wayland / X11。

启动器平台信息核对于 2026-11-01，来源：[Alfred 官网](https://www.alfredapp.com/)、[Vicinae 平台说明](https://docs.vicinae.com/os-support)、[Raycast 官网](https://www.raycast.com/)及 [Windows 版说明](https://www.raycast.com/windows)。

## 下载与安装

从 [GitHub Releases](https://github.com/AndreGeng/FelixDict/releases) 选择 **v0.2.0 或更新版本**，按启动器下载：

| 启动器 | Release 附件 | 安装方式 |
| --- | --- | --- |
| Alfred | `Alfred-FelixDict-*.alfredworkflow` | 双击导入，需要 Powerpack 和 Node.js 18+ |
| Vicinae | `FelixDict-Vicinae-*.zip` | 解压，按包内 INSTALL.md 复制预编译扩展目录，无需编译 |
| Raycast | `FelixDict-Raycast-source-*.zip` | 解压后执行 `npm ci`、`npm run dev:raycast`，需要 Node.js 22.22.2+ |

Raycast 另提供官方 `.rayext` 预编译包，但当前已验证的安装路径为源码 ZIP，不能保证双击导入。请下载上述附件，而不是 GitHub 自动生成的 Source code 归档。各版本暂未上架扩展商店。附件校验值见 `SHA256SUMS`。

## Alfred

适用于 **macOS + Alfred 5 Powerpack**，运行需要 Node.js 18+。

呼出 Alfred，直接输入关键词和查询内容：

```text
fd hello
fd trans
fd :ja 你好
```

**单词释义与音标**

![Alfred 中的单词释义、音标与相关词](docs/screenshots/dictionary.jpg)

**前缀联想**：输入 `fd trans`，通过释义找到需要的完整单词。

![Alfred 中的前缀联想](docs/screenshots/suggestions.jpg)

**多语言翻译**：用 `fd :ja 你好` 指定译成日语。

![Alfred 中的日语翻译](docs/screenshots/translation.jpg)

Enter 复制，⌘Enter 朗读，⌘L 大字查看全文，Tab 补全候选词。

→ [Alfred 安装与详细使用说明](apps/alfred/README.md)

## Vicinae

在 Vicinae 主搜索输入 `fd`，选中 **FelixDict** 后按 Enter 进入查词页面，再输入 `hello`、`trans` 或 `:ja 你好`。输入时会实时查询和联想。

**命令入口**：搜索结果中显示 `fd` 别名和 FD 图标。

![Vicinae 中带 fd 别名的 FelixDict 命令](docs/screenshots/vicinae-entry.jpg)

**前缀联想**：候选词与释义在同一列表中展示。

![Vicinae 中 FelixDict 的前缀联想](docs/screenshots/vicinae-suggestions.jpg)

Enter 复制，⌘Enter 朗读，⌘L 打开可滚动的全文详情，⌘O 补全候选词；Linux 对应使用 Ctrl 修饰键。Vicinae 的标题和副标题在同一行显示，与 Alfred 的双行布局不同。

Vicinae 版已在 macOS 和 Arch Linux 验证，截图来自 macOS。Linux 朗读需要配置 Speech Dispatcher（`spd-say`）。

→ [Vicinae 安装与详细使用说明](apps/vicinae/README.md)

## Raycast

适用于 **macOS + Raycast**。在主搜索输入 `fd` 或 `FelixDict`，按 Enter 进入命令，再输入单词或句子。可在 Raycast Settings → Extensions 中将命令的 Alias 设置为 `fd`。

**前缀联想与音标**

![Raycast 中的单词联想与音标](docs/screenshots/raycast-suggestions.jpg)

**多语言翻译**：输入 `:ja hello` 查看日语译文。

![Raycast 中的日语翻译](docs/screenshots/raycast-translation.jpg)

Enter 复制，⌘Enter 朗读并保留窗口，⌘L 查看全文，⌘O 补全候选词。与 Vicinae 一样，实时联想出现在进入命令后的查词页面。

目前通过源码安装，尚未发布到 Raycast Store：在仓库根目录执行 `npm ci` 和 `npm run dev:raycast`，构建成功后即可停止开发命令，扩展会保留在本机。

→ [Raycast 安装与详细使用说明](apps/raycast/README.md)

三个平台的截图均为实际查询结果，中英文文档共用中文界面截图；在线结果可能变化。词典项朗读查询词，翻译项朗读译文，建议项朗读完整候选词。

## 仓库结构

```text
apps/
  alfred/                 Alfred CLI、结果 JSON 适配、启动脚本和打包工具
  vicinae/                Vicinae React 界面和安装构建
  raycast/                Raycast React 界面和扩展构建
packages/
  core/                   语言处理、服务接口、查询状态、缓存工具和通用结果模型
test/                     TypeScript 回归测试和 Python 打包测试
docs/                     截图等共享文档资源
```

使用 npm workspaces，依赖版本统一记录在根目录 `package-lock.json`。
应用通过 `@felixdict/core` 包导入共享能力，不跨目录读取另一个应用的源码。
`core` 不依赖任何启动器 SDK；Alfred 的 JSON 协议和快捷键字段由 `apps/alfred` 生成。

## 开发

需要 Node.js 22.22.2+、npm 和 Python 3（Alfred 打包）。所有 Node 源码、构建辅助脚本和测试均使用 TypeScript，并开启 strict 类型检查。

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

- `npm run build:alfred`：先编译共享包和 Alfred CLI，再生成 `dist/Alfred-FelixDict-0.2.0.alfredworkflow`。不会导入或覆盖已安装的 Alfred Workflow。
- `npm run build:vicinae`：先编译共享包，再构建并安装到当前用户的 Vicinae 扩展目录。
- `npm run build:raycast`：编译并验证 Raycast 扩展，不导入本机；`npm run dev:raycast` 构建并导入本机 Raycast。
- `npm run build`：依次构建三个应用；其中 Vicinae 构建会执行本地安装。
- `npm test`：编译测试需要的运行时代码，执行 TypeScript 测试和 Alfred 打包检查。

TypeScript 编译产物位于各包的 `dist/`，不提交到 Git。Alfred 安装包包含编译后的 JavaScript 和本地共享包，无需用户安装 TypeScript 或执行 npm install，运行时仍支持 Node.js 18+。
Vicinae 将共享代码打包进扩展，运行时不依赖仓库路径。

## 许可与来源

MIT。上游协议和代码来源见 [THIRD_PARTY.md](THIRD_PARTY.md)。

发布流程见 [发布说明](docs/RELEASING.md)。
