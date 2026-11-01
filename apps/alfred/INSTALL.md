# FelixDict for Alfred

在 Alfred 中查词、联想补全和翻译，无需翻译 API Key。

## 运行要求

macOS、Alfred 5 Powerpack、Node.js 18+。

未安装 Node.js 时，对查询中的安装提示按 Enter，打开 [Alfred 官方依赖安装指引](https://www.alfredapp.com/help/kb/install-dependencies/)。已安装但未识别时，将下方 `node_path` 设置为 Node.js 可执行文件的绝对路径。

## 开始使用

呼出 Alfred，输入：

- `fd hello`：查看词典释义、读音和翻译。
- `fd trans`：查看有道联想，选中候选后按 Tab 补全并查询。
- `fd :ja 你好`：指定译成日语；也支持 `:en`、`:fr` 等目标语言。

## 快捷键

- **Enter**：复制当前释义、译文或完整候选词。
- **⌘Enter**：朗读查询词、译文或候选词，保持窗口打开。
- **⌘L**：大字查看当前条目已有的全文，不重新查询。
- **Tab**：补全选中的联想词并查询详细词条。

## 配置与提示

默认启用 `Youdao,Google,Bing`，可在下方 `providers` 调整。首选目标语言为 `zh`，第二语言为 `en`；`:语言 内容` 可临时指定目标。

查询需要联网，服务可用性受网络和上游接口影响。有道部分翻译语种对不受支持；一个来源失败不影响其他结果。查询缓存保存在本机，未加密。

[完整图文说明](https://github.com/AndreGeng/FelixDict/blob/main/apps/alfred/README.md) · [下载与更新](https://github.com/AndreGeng/FelixDict/releases) · [反馈问题](https://github.com/AndreGeng/FelixDict/issues)
