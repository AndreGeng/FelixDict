# FelixDict for Raycast

**中文** · [English](README.en.md)

在 Raycast 中查词、查看音标、联想拼写和翻译句子。与 Alfred、Vicinae 版本共用查询、缓存有效期、结果排序及朗读逻辑，无需运行 Easydict App。

## 安装

可从 [Releases](https://github.com/AndreGeng/FelixDict/releases) 下载 v0.2.0+ 的 `FelixDict-Raycast-source-*.zip`，无需克隆完整仓库。详细步骤见 [安装指南](../../docs/install-raycast.md)。

以下为仓库源码安装方式。

Raycast 本身支持 macOS 和 Windows。FelixDict 的 Raycast 扩展已在 macOS 验证，Windows 尚待验证，欢迎试用并反馈问题。需要 Raycast；从源码构建需要 Node.js 22.22.2+、npm，以及完整仓库。

在仓库根目录执行：

```sh
npm ci
npm run dev:raycast
```

构建成功后，扩展会导入本机 Raycast。可以停止开发命令，扩展仍保留在 Raycast 中。修改代码后再次运行该命令更新。

仅检查构建、不导入扩展：

```sh
npm run build:raycast
```

尚未发布到 Raycast Store。

各启动器支持的系统、项目已验证的环境及其它环境的问题反馈方式，见[平台与验证范围](../../README.md#选哪个版本)。

## 使用

在 Raycast 搜索 `fd` 或 `FelixDict`，选中命令并回车进入，再输入 `hello`、`trans`、`:ja 你好` 或句子。查词页面会实时查询并显示联想。

`fd` 是扩展声明的搜索关键词。若希望设为专用别名，可在 Raycast Settings → Extensions 中找到 FelixDict 命令，将 Alias 设置为 `fd`。主搜索的可选参数框用于传入初始查询，不会直接展示词典联想。

| 操作 | 快捷键 | 行为 |
| --- | --- | --- |
| 复制 | Enter | 复制释义、译文或完整候选词，关闭窗口 |
| 朗读 | ⌘Enter | 词典读查询词，翻译读译文，建议项读完整单词；保留窗口 |
| 全文 | ⌘L | 打开详情，Esc 返回列表 |
| 补全 | ⌘O | 补全候选词并查询 |

选中建议词后会补查音标。日语假名、韩文和中文会选择对应的已安装 macOS 语音；其他文字使用默认语音。

## 截图

![Raycast 中的联想结果、音标和日语翻译](../../docs/screenshots/raycast-suggestions.jpg)

![Raycast 中的联想结果、音标和日语翻译](../../docs/screenshots/raycast-translation.jpg)

## 配置与数据

在 Raycast 扩展设置中配置：

- **Preferred target language**：首选目标，默认 `zh`。
- **Secondary language**：源语言与首选目标相同时使用，默认 `en`，必须与首选目标不同。
- **Providers**：默认 `Youdao,Google`，可选 `Bing`。

启用 `Youdao` 即可同时使用有道词典、联想和多语言翻译，无需新增设置或配置 API Key。有道网页翻译受语种对限制，未能处理时会提示使用 Google / Bing，其他来源的结果仍可使用。 测试范围与已知语种对、错译问题见[语言实测记录](../../docs/youdao-language-support.md)。

- **Cache hours**：默认 24，范围 0–168，0 关闭缓存。

目标语言支持 `zh/en/ja/ko/fr/de/es/it/pt/ru/ar`；`:语言 内容` 临时指定翻译目标。有道词典和前缀联想保留中英范围。

查询通过系统 curl 发送给启用的服务；无需 API Key。缓存独立存储在 Raycast 扩展目录，容量为 5 MB，不加密。不会读取其他插件的缓存或设置，也不会自动读取剪贴板。

## 开发

界面位于 `src/search.tsx`，共享查询会话位于 `packages/core/src/session.ts`。构建会将共享包打入扩展，不依赖仓库路径运行。

```sh
npm run typecheck
npm test
npm run build:raycast
```
