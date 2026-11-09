# Rewind for X 推文回看

X 的首页推荐经常一刷新就把刚才看到的好帖子顶掉。这个 Chrome 扩展会默默记下你在首页**看到过**的每条推文，让你随时回看。

- 推文在屏幕上露出一半以上就算"看过"，记下作者、正文、图片、引用推文、转帖人和链接
- 只记录首页时间线（推荐 / 关注），广告不记，推文详情页、个人主页也不记
- 点右下角的按钮（叠在 X 的 Grok / 聊天按钮上方；或工具栏图标、`Alt+Shift+R`）打开抽屉：最新的在最上面，按浏览时段分组，可以搜索
- 点推文会在新标签页打开，不会让当前首页再刷新一次
- 数据只存在本机（`chrome.storage.local`），最多保留 3000 条，可一键清空

非 X 官方产品，与 X Corp. 无关。

## 安装

1. 从 [最新 Release](https://github.com/lisihao/rewind-for-x/releases/latest) 的 **Assets** 下载 `rewind-for-x-<版本>.zip`（不要下载 GitHub 自动生成的 Source code）
2. 解压到一个长期保留的文件夹；安装后不要删除或移动它
3. 在电脑上的 Chrome 打开 `chrome://extensions`，打开右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择解压后包含 `manifest.json` 的文件夹
5. 确认扩展列表中出现 Rewind for X，然后打开或刷新 `https://x.com/home`

这是手工安装的扩展，不会自动更新。更新时下载新版并解压到原文件夹，替换旧文件，然后在 `chrome://extensions` 点击该扩展的重新加载按钮，再刷新 X 页面。请勿先移除扩展，以免丢失本机保存的回看记录。

源码开发者也可以直接加载本仓库目录。详细步骤见 [INSTALL.md](INSTALL.md)。

## 测试

```
node test/e2e.mjs   # 需要 Playwright + Chromium
node test/mobile.mjs
```

用模拟 X 页面结构的页面跑真实扩展：记录、刷新后保留、忽略广告和非首页、跳过翻译扩展插入的译文、按钮避开 X 的 Grok/聊天按钮、抽屉列表、搜索、点外面关闭、清空、深色主题。

`tools/icons.py` 生成 `icons/`。

发布前可设置 `EXTENSION_PATH` 为 ZIP 解压目录，直接对发布包运行上述测试。

## 上架 Chrome 网上应用店

- `tools/pack.sh`：打包 `dist/rewind-for-x-<版本>.zip`，包含 manifest、两个脚本、`_locales/`、`icons/`、安装指南和 MIT 许可；也可解压后手工安装
- `node tools/store-assets.mjs`：重新生成 `store/screenshots/`（1280×800，中英文 × 浅色 / 深色 / 搜索）和 `store/promo/`（440×280 小宣传图、1400×560 大宣传图），帖子全是虚构的
- `store/listing.md`：商店描述（中英文）和隐私表单要填的每一段文字
- `store/privacy-policy.html`：隐私政策页面，由 GitHub Pages 发布在 https://yetone.github.io/rewind-for-x/store/privacy-policy.html

## License

[MIT](LICENSE)
